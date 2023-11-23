import {UserModel} from "@/local-storage/userModel";

// Get the user data from local storage, or create a new user if none exists
export function getUserData(link: string): UserModel {
    const userString = localStorage.getItem(link);
    if (userString) {
        const user = JSON.parse(userString);
        user.liked = new Set(user.liked);
        user.writtenIdeas = new Set(user.writtenIdeas);
        user.writtenPros = new Set(user.writtenPros);
        user.writtenCons = new Set(user.writtenCons);
        return user;
    }
    // If no user data exists, create a new user
    const newUser: UserModel = {
        userId: generateRandomUserID(255),
        hasVoted: false,
        liked: new Set(),
        writtenIdeas: new Set(),
        writtenPros: new Set(),
        writtenCons: new Set(),
    };
    writeUserData(link, newUser);
    return newUser;
}

export function writeUserData(link: string, userData: UserModel): void {
    localStorage.setItem(link, JSON.stringify({
        userId: userData.userId,
        hasVoted: userData.hasVoted,
        liked: Array.from(userData.liked),
        writtenIdeas: Array.from(userData.writtenIdeas),
        writtenPros: Array.from(userData.writtenPros),
        writtenCons: Array.from(userData.writtenCons),
    }));
}

function generateRandomUserID(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}