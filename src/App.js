import React, { useEffect, useReducer } from "react";
import reducer, { STATUS } from "./reducer";
import { fetchMovieReviews } from "./api";
import "./App.css";

function times(n, iterator) {
  var accum = Array(Math.max(0, n));
  for (var i = 0; i < n; i++) accum[i] = iterator(i);
  return accum;
}

function App() {
  const [
    { status, reviews, rating, queryParams, error },
    dispatch,
  ] = useReducer(reducer, {
    status: STATUS.INITIAL,
    reviews: [],
    reviewer: null,
    queryParams: {
      "api-key": process.env.REACT_APP_MOVIE_REVIEW_API_KEY,
    },
  });
  console.log(status);

  async function loadReviews() {
    const controller = new AbortController();
    const { signal } = controller;
    dispatch({ type: "fetchReviewsStart", controller });
    try {
      const payload = await fetchMovieReviews({ ...queryParams, signal });
      dispatch({ type: "fetchReviewsSuccess", payload, controller });
    } catch (error) {
      dispatch({ type: "fetchReviewsFailure", controller, error });
    }
  }

  async function loadMoreReviews() {
    const controller = new AbortController();
    const { signal } = controller;
    dispatch({ type: "fetchMoreReviewsStart", controller });
    try {
      const payload = await fetchMovieReviews({
        ...queryParams,
        offset: reviews.length,
        signal,
      });
      dispatch({ type: "fetchReviewsSuccess", payload, controller });
    } catch (error) {
      dispatch({ type: "fetchReviewsFailure", controller, error });
    }
  }

  async function handleSelectReviewer({ target: { value } }) {
    const controller = new AbortController();
    const { signal } = controller;
    dispatch({
      type: "fetchReviewsStart",
      queryParams: !!value ? { reviewer: value } : {},
      controller,
    });
    try {
      const payload = await fetchMovieReviews({
        ...queryParams,
        reviewer: value,
        signal,
      });
      dispatch({ type: "fetchReviewsSuccess", payload, controller });
    } catch (error) {
      dispatch({ type: "fetchReviewsFailure", controller, error });
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  const isLoading = [
    "initial",
    "fetchingReviews",
    "fetchingMoreReviews",
  ].includes(status);
  const willLoadMore = status === STATUS.IDLE;
  const isFailed = status === STATUS.FAILED;

  return (
    <div className="App max-w-3xl px-4 py-10 mx-auto">
      <div className="flex justify-between mb-5">
        <select
          value={rating}
          onChange={handleSelectReviewer}
          className="block appearance-none w-15 bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Filter by reviewer...</option>
          <option value="Glenn Kenny">Glenn Kenny</option>
          <option value="Jeannette Catsoulis">Jeannette Catsoulis</option>
          <option value="Amy Nicholson">Amy Nicholson</option>
          <option value="Devika Girish">Devika Girish</option>
        </select>
        {isFailed && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error.toString()}</span>
          </div>
        )}
      </div>
      <div>
        <table className="table-fixed w-full text-left">
          <thead>
            <tr>
              <th className="text-left px-4 py-2 w-1/2">Book Title</th>
              <th className="text-left px-4 py-2 w-1/4">Reviewer</th>
              <th className="text-left px-4 py-2 w-1/4">Review</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.display_title}>
                <td className="border px-4 py-2">{review.display_title}</td>
                <td className="border px-4 py-2">{review.byline}</td>
                <td className="border px-4 py-2">
                  <a className="text-blue-700" href={review.link.url}>
                    Read
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isLoading &&
        times(20, (i) => (
          <div className="border border-t-0 py-2" key={`loading-${i}`}>
            Loading...
          </div>
        ))}
      {willLoadMore && (
        <button className="mt-4" onClick={loadMoreReviews}>
          Load more...
        </button>
      )}
    </div>
  );
}

export default App;
