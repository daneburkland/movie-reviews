export async function fetchMovieReviews({ signal, ...params }) {
  const queryStringParams = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  try {
    const response = await fetch(
      `https://api.nytimes.com/svc/movies/v2/reviews/search.json?${queryStringParams}`,
      { signal }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  } catch (error) {
    throw new Error(error);
  }
}
