import gql from "graphql-tag";

export const MOVIES = gql`
    query Movies(
        $titleRegex: String
        $limit: Int
        $skip: Int
        $skipPlusOne: Int
    ) {
        Movies(
            where: { title_REGEX: $titleRegex, imdbRating_GTE: 1 }
            options: {
                limit: $limit
                skip: $skip
                sort: [poster_ASC, imdbRating_DESC]
            }
        ) {
            movieId
            title
            poster
            imdbRating
        }
        hasNextMovies: Movies(
            where: { title_REGEX: $titleRegex, imdbRating_GTE: 1 }
            options: {
                limit: 1
                skip: $skipPlusOne
                sort: [poster_ASC, imdbRating_DESC]
            }
        ) {
            movieId
        }
    }
`;

export const MOVIE = gql`
    query Movie($movieId: ID) {
        Movies(where: { movieId: $movieId }) {
            movieId
            title
            plot
            poster
            imdbRating
            similar(skip: 0, limit: 12) {
                movieId
                title
                poster
                imdbRating
            }
        }
    }
`;
