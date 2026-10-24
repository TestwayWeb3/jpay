// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title JPayPayment
/// @notice Registri invoice onchain minimal untuk pembayaran QR JPay di Monad.
/// @dev Pembayaran memakai native MON. Merchant membuat invoice, customer membayar
///      dengan `pay(paymentId)` dan dana langsung diteruskan ke merchant.
contract JPayPayment {
    /// @notice Data satu invoice pembayaran.
    /// @dev Field `isPaid`, `payer`, dan `createdAt` dipaketkan dalam satu storage slot
    ///      (1 + 20 + 5 = 26 byte) sehingga menulis status pembayaran hanya 1 SSTORE.
    struct Payment {
        address merchant;
        uint256 amount;
        string description;
        bool isPaid;
        address payer;
        uint40 createdAt;
    }

    /// @notice Batas panjang deskripsi untuk mencegah invoice menggemukkan storage.
    uint256 public constant MAX_DESCRIPTION_LENGTH = 200;

    /// @notice Jumlah invoice yang pernah dibuat. Sekaligus ID invoice terakhir.
    uint256 public paymentCount;

    mapping(uint256 paymentId => Payment payment) private _payments;

    event PaymentCreated(
        uint256 indexed paymentId,
        address indexed merchant,
        uint256 amount,
        string description,
        uint40 createdAt
    );

    event PaymentPaid(
        uint256 indexed paymentId,
        address indexed merchant,
        address indexed payer,
        uint256 amount
    );

    error InvalidAmount();
    error DescriptionTooLong();
    error PaymentNotFound();
    error AlreadyPaid();
    error IncorrectAmount(uint256 expected, uint256 received);
    error MerchantCannotPay();
    error TransferFailed();

    /// @notice Merchant membuat invoice baru.
    /// @param amount Nominal yang harus dibayar, dalam wei MON.
    /// @param description Label singkat, mis. "Kopi Susu - Kedai Jogja".
    /// @return paymentId ID invoice yang dipakai di URL /pay/[paymentId] dan QR.
    function createPayment(
        uint256 amount,
        string calldata description
    ) external returns (uint256 paymentId) {
        if (amount == 0) revert InvalidAmount();
        if (bytes(description).length > MAX_DESCRIPTION_LENGTH) {
            revert DescriptionTooLong();
        }

        paymentId = ++paymentCount;

        Payment storage payment = _payments[paymentId];
        payment.merchant = msg.sender;
        payment.amount = amount;
        payment.description = description;
        payment.createdAt = uint40(block.timestamp);

        emit PaymentCreated(
            paymentId,
            msg.sender,
            amount,
            description,
            payment.createdAt
        );
    }

    /// @notice Customer membayar invoice. Harus mengirim tepat `amount` wei.
    /// @dev Mengikuti pola checks-effects-interactions: status diubah sebelum transfer
    ///      sehingga merchant tidak bisa re-enter untuk invoice yang sama.
    function pay(uint256 paymentId) external payable {
        Payment storage payment = _payments[paymentId];

        address merchant = payment.merchant;
        if (merchant == address(0)) revert PaymentNotFound();
        if (payment.isPaid) revert AlreadyPaid();
        if (msg.sender == merchant) revert MerchantCannotPay();

        uint256 amount = payment.amount;
        if (msg.value != amount) revert IncorrectAmount(amount, msg.value);

        payment.isPaid = true;
        payment.payer = msg.sender;

        emit PaymentPaid(paymentId, merchant, msg.sender, amount);

        (bool ok, ) = payable(merchant).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    /// @notice Membaca detail invoice. Revert jika ID tidak pernah dibuat.
    function getPayment(
        uint256 paymentId
    ) external view returns (Payment memory) {
        Payment memory payment = _payments[paymentId];
        if (payment.merchant == address(0)) revert PaymentNotFound();
        return payment;
    }
}
