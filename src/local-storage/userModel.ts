export type UserModel = {
    userId: string;
    hasVoted: boolean;
    liked: Set<string>;
    writtenIdeas: Set<string>;
    writtenPros: Set<string>;
    writtenCons: Set<string>;
}
