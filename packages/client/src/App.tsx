import React, { useCallback, useContext, useEffect, useState } from "react";
import {
    Alert,
    Card,
    Container,
    Button,
    Row,
    Col,
    Spinner,
    Modal,
} from "react-bootstrap";
import * as ApolloClient from "./ApolloClient";
import {
    BrowserRouter,
    Switch,
    Route,
    Link,
    useLocation,
    useHistory,
} from "react-router-dom";
import { MOVIES, MOVIE } from "./queries";
import { DebounceInput } from "react-debounce-input";

interface Movie {
    movieId: string;
    title: string;
    poster: string;
    plot: string;
    imdbRating: number;
    similar: Movie[];
}

function MovieModal({
    initial,
    setSelected,
}: {
    initial: string;
    close: () => void;
    setSelected: (s: string) => void;
}) {
    const client = useContext(ApolloClient.Context);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [movie, setMovie] = useState<Movie | undefined>();
    const [selectedMovieId, setSelectedMovieId] = useState(initial);

    useEffect(() => {
        (async () => {
            setLoading(true);

            try {
                const data = await client.query({
                    query: MOVIE,
                    variables: {
                        movieId: selectedMovieId,
                    },
                });

                setMovie(data.Movies[0]);
            } catch (e) {
                setError(e.message);
            }

            setLoading(false);
        })();
    }, [selectedMovieId]);

    if (loading) {
        return (
            <div className="d-flex align-items-center m-4">
                <Spinner animation="border" role="status" className="mx-auto">
                    <span className="sr-only">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex align-items-center m-4">
                <Alert variant="danger">{error}</Alert>
            </div>
        );
    }

    return (
        <>
            <Modal.Header>
                <Modal.Title>{movie.title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Row>
                    <Col sm={6}>
                        <Card className="p-4">
                            <img
                                src={movie.poster}
                                className="w-50 mx-auto"
                            ></img>
                        </Card>
                    </Col>
                    <Col sm={6}>
                        <div>
                            <h2>{movie.title}</h2>
                            <p>{movie.plot}</p>
                            <p>Rating: {movie.imdbRating}</p>
                        </div>
                    </Col>
                    <div className="p-3">
                        <h2>Similar</h2>
                        <Row>
                            {movie.similar.map((m) => (
                                <Col sm={6} className="mt-2">
                                    <Card>
                                        <Card.Body className="d-flex">
                                            <img
                                                src={m.poster}
                                                className="w-50 mx-auto"
                                            ></img>
                                        </Card.Body>
                                        <Card.Footer>
                                            <Link
                                                to={`/?movieId=${m.movieId}`}
                                                onClick={() => {
                                                    setSelected(m.movieId);
                                                    setSelectedMovieId(
                                                        m.movieId
                                                    );
                                                }}
                                            >
                                                {m.title}
                                            </Link>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </Row>
            </Modal.Body>
        </>
    );
}

function BigMovie({
    movie,
    setSelected,
}: {
    movie: Movie;
    setSelected: (s: string) => void;
}) {
    return (
        <Card key={movie.movieId}>
            <Card.Header>{movie.title}</Card.Header>
            <Card.Img variant="top" src={movie.poster} />
            <Card.Body>
                <Card.Text>Rating {movie.imdbRating}</Card.Text>
                <Link
                    to={`/?movieId=${movie.movieId}`}
                    onClick={() => setSelected(movie.movieId)}
                >
                    Read More
                </Link>
            </Card.Body>
        </Card>
    );
}

function Home() {
    const location = useLocation();
    const history = useHistory();
    const client = useContext(ApolloClient.Context);
    const params = new URLSearchParams(location.search);
    const baseLimit = 12;

    const [limit, setLimit] = useState(
        Number(params.get("limit")) || baseLimit
    );
    const [skip, setSkip] = useState(Number(params.get("skip")) || 0);
    const [search, setSearch] = useState(params.get("search") || "");
    const [selected, setSelected] = useState<string>("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [hasNextMovies, setHasNextMovies] = useState(false);

    const getMovies = useCallback(async () => {
        setLoading(true);

        try {
            const data = await client.query({
                query: MOVIES,
                variables: {
                    ...(search ? { titleRegex: `(?i).*${search}.*` } : {}),
                    skip,
                    limit,
                    skipPlusOne: skip + 1,
                },
            });

            setMovies(data.Movies);
            setHasNextMovies(Boolean(data.hasNextMovies.length));
        } catch (e) {
            setError(e.message);
        }

        setLoading(false);
    }, [search, skip, limit]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSearch((s) => params.get("search") || s);
        setSelected((s) => params.get("movieId") || s);
        setSkip(Number(params.get("skip")) || 0);
        setLimit(Number(params.get("limit")) || baseLimit);
        getMovies();
    }, []);

    useEffect(() => {
        if (!selected && !search && !limit && !skip) {
            return;
        }

        history.push(
            `/?${selected ? `movieId=${selected}` : ""}${
                search ? `&search=${search}` : ""
            }${limit ? `&limit=${limit}` : ""}${skip ? `&skip=${skip}` : ""}`
        );

        getMovies();
    }, [search, selected, skip, limit]);

    if (error) {
        return <Alert>{error}</Alert>;
    }

    return (
        <Container className="pt-4">
            <Modal
                aria-labelledby="contained-modal-title-vcenter"
                centered
                size="lg"
                show={Boolean(selected)}
                onHide={() => setSelected(() => undefined)}
            >
                <MovieModal
                    close={() => setSelected(() => undefined)}
                    initial={selected}
                    setSelected={(s: string) => {
                        setSelected(s);
                    }}
                ></MovieModal>
            </Modal>

            <DebounceInput
                disabled={loading}
                type="text"
                autoFocus={true}
                debounceTimeout={1000}
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                aria-label="Small"
                aria-describedby="inputGroup-sizing-lg"
                placeholder="Search Movies"
                className="form-control"
            />

            <Row>
                {movies.map((movie) => (
                    <Col sm={1} md={4} className="pt-2 pb-2 ">
                        <BigMovie
                            movie={movie}
                            setSelected={(s: string) => setSelected(s)}
                        ></BigMovie>
                    </Col>
                ))}
            </Row>

            {loading && (
                <div className="d-flex align-items-center mt-4">
                    <Spinner
                        animation="border"
                        role="status"
                        className="mx-auto"
                    >
                        <span className="sr-only">Loading...</span>
                    </Spinner>
                </div>
            )}

            {(hasNextMovies || skip > 1) && (
                <div className="d-flex align-items-center mt-4">
                    <div className="mx-auto pb-3">
                        {skip > 1 && (
                            <Button
                                variant="secondary"
                                onClick={() => setSkip((s) => s - 1)}
                            >
                                Back
                            </Button>
                        )}
                        {hasNextMovies && (
                            <Button
                                onClick={() => setSkip((s) => s + limit)}
                                className="ml-2"
                            >
                                Next Page
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </Container>
    );
}

function Router() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path={"/"} component={Home} />
            </Switch>
        </BrowserRouter>
    );
}

export default function App() {
    return (
        <ApolloClient.Provider>
            <Router></Router>
        </ApolloClient.Provider>
    );
}
