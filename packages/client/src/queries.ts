import gql from "graphql-tag";

export const MOVIES = gql`
    query Movies(
        $titleRegex: String
        $limit: Int
        $skip: Int
        $hasNextSkip: Int
    ) {
        movies(
            where: {
                title_REGEX: $titleRegex
                poster_NOT: null
                imdbRating_NOT: null
            }
            options: { limit: $limit, skip: $skip, sort: [imdbRating_DESC] }
        ) {
            movieId
            title
            poster
            imdbRating
        }
        hasNextMovies: movies(
            where: {
                title_REGEX: $titleRegex
                poster_NOT: null
                imdbRating_NOT: null
            }
            options: { limit: 1, skip: $hasNextSkip, sort: [imdbRating_DESC] }
        ) {
            movieId
        }
    }
`;

export const MOVIE = gql`
    query Movie($movieId: ID) {
        movies(where: { movieId: $movieId }) {
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
            genres {
                name
            }
        }
    }
`;
