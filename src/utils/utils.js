export const generatePassword = (length = 12)=> {
    // Đảm bảo độ dài mật khẩu tối thiểu là 8 ký tự
    if (length < 8) {
        throw new Error("Password length must be at least 8 characters.");
    }

    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialCharacters = "@$!%*?&";
    const allCharacters = upperCase + lowerCase + numbers + specialCharacters;

    // Bắt buộc mỗi loại ký tự có ít nhất 1 ký tự
    const getRandomChar = (charset) =>
        charset[Math.floor(Math.random() * charset.length)];

    let password = [
        getRandomChar(upperCase),
        getRandomChar(lowerCase),
        getRandomChar(numbers),
        getRandomChar(specialCharacters),
    ];

    // Bổ sung các ký tự ngẫu nhiên để đạt đủ độ dài yêu cầu
    while (password.length < length) {
        password.push(getRandomChar(allCharacters));
    }

    // Trộn ngẫu nhiên các ký tự trong mảng
    password = password.sort(() => Math.random() - 0.5);

    return password.join("");
}
export const generateUsername = (input)=> {
    if (!input || typeof input !== "string") {
        throw new Error("Invalid input: Please provide a valid string.");
    }

    return input
        .split(" ") // Tách chuỗi thành các từ
        .filter(word => word.trim().length > 0) // Loại bỏ từ rỗng
        .map(word => word[0].toUpperCase()) // Lấy ký tự đầu và viết hoa
        .join(""); // Ghép lại thành chuỗi
}