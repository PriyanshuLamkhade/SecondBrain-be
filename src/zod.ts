import z from "zod"

export const requiredBody =z.object({
    username: z.string().min(2,"User Name is too short").max(30,"User Name is too Big"),
    password:z.string().min(4).max(50).refine(value => {
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecialCharacter = /[!@#$%^&*()_+<>?:"{}|]/.test(value);

        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialCharacter
    }, {
        message: "String must contain at least one lowercase letter, one uppercase letter, one number and one special character."
    })
})