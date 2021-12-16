import * as bcrypt from "bcrypt";

export async function isValidPassword(
    newPassword: string,
    oldPassword?: string
): Promise<{
    isValid: boolean;
    message: string;
}> {
    if (!newPassword) {
        return {
            isValid: false,
            message: "Password cannot be empty!",
        };
    }

    if (newPassword.length <= 5) {
        return {
            isValid: false,
            message: "Password must be atleast 6 characters long!",
        };
    }

    if (oldPassword) {
        const isSame = await bcrypt.compare(newPassword, oldPassword);

        if (isSame) {
            return {
                isValid: false,
                message: "Password must be different from current one!",
            };
        }
    }

    return {
        isValid: true,
        message: "New password is valid",
    };
}

export function isValidID(id: string): {
    isValid: boolean;
    message: string;
} {
    if (!id) {
        return {
            isValid: false,
            message: "ID cannot be empty!",
        };
    }

    if (id.length < 5) {
        return {
            isValid: false,
            message: "ID must be atleast 6 characters long!",
        };
    }

    // 5 to 20 length long
    // starts with an alphabet
    // can contain small/uppercase alphabets, numbers and underscores
    let re = /^[a-zA-Z][a-zA-Z0-9_]{4,20}$/;
    const isValid = re.exec(id);

    if (!isValid) {
        return {
            isValid: false,
            message: "ID must start with an alphabet and can only contain alphanumeric characters and underscores",
        };
    }

    return {
        isValid: true,
        message: "ID is valid",
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isValidBio(bio?: string): {
    isValid: boolean;
    message: string;
} {
    return {
        isValid: true,
        message: "Bio is valid",
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isValidAvatar(avatar?: string): {
    isValid: boolean;
    message: string;
} {
    return {
        isValid: true,
        message: "Avatar is valid",
    };
}

export function isValidName(name: string): {
    isValid: boolean;
    message: string;
} {
    if (!name) {
        return {
            isValid: false,
            message: "Name cannot be empty!",
        };
    }

    return {
        isValid: true,
        message: "Name is valid",
    };
}