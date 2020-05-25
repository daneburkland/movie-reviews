export const STATUS = Object.freeze({
  INITIAL: "initial",
  FETCHING_REVIEWS: "fetchingReviews",
  FETCHING_MORE_REVIEWS: "fetchingMoreReviews",
  IDLE: "idle",
  HAS_FETCHED_ALL_REVIEWS: "hasFetchedAllReviews",
  FAILED: "failed",
});

export default function reducer(state, action) {
  switch (state.status) {
    case STATUS.INITIAL:
      switch (action.type) {
        case "fetchReviewsStart":
          return {
            ...state,
            status: STATUS.FETCHING_REVIEWS,
            controller: action.controller,
          };
        default:
          throw new Error(
            `Unexpected event ${action.type} sent to the '${STATUS.INITIAL}' state.`
          );
      }
    case STATUS.FETCHING_REVIEWS:
      switch (action.type) {
        case "fetchReviewsStart":
          state.controller.abort();
          return {
            ...state,
            status: STATUS.FETCHING_REVIEWS,
            controller: action.controller,
          };
        case "fetchReviewsSuccess":
          // if a new fetch is pending, we don't care about this one
          if (action.controller !== state.controller) {
            return state;
          }
          return {
            ...state,
            status: action.payload.has_more
              ? STATUS.IDLE
              : STATUS.HAS_FETCHED_ALL_REVIEWS,
            reviews: [...action.payload.results],
          };
        case "fetchReviewsFailure":
          if (action.controller !== state.controller) {
            return state;
          }
          return {
            ...state,
            status: STATUS.FAILED,
            error: action.error,
          };
        default:
          throw new Error(
            `Unexpected event ${action.type} sent to the '${STATUS.FETCHING_REVIEWS}' state.`
          );
      }
    case STATUS.FETCHING_MORE_REVIEWS:
      switch (action.type) {
        case "fetchReviewsStart":
          state.controller.abort();
          return {
            ...state,
            status: STATUS.FETCHING_REVIEWS,
            controller: action.controller,
          };
        case "fetchMoreReviewsStart":
          state.controller.abort();
          return {
            ...state,
            status: STATUS.FETCHING_MORE_REVIEWS,
            controller: action.controller,
          };
        case "fetchReviewsSuccess":
          if (action.controller !== state.controller) {
            return state;
          }
          return {
            ...state,
            status: action.payload.has_more
              ? STATUS.IDLE
              : STATUS.HAS_FETCHED_ALL_REVIEWS,
            reviews: [...state.reviews, ...action.payload.results],
          };
        case "fetchReviewsFailure":
          if (action.controller !== state.controller) {
            return state;
          }
          return { ...state, status: STATUS.FAILED, error: action.error };
        default:
          throw new Error(
            `Unexpected event ${action.type} sent to the '${STATUS.FETCHING_MORE_REVIEWS}' state.`
          );
      }
    case STATUS.IDLE:
    case STATUS.FAILED:
      switch (action.type) {
        case "fetchReviewsStart":
          return {
            ...state,
            status: STATUS.FETCHING_REVIEWS,
            controller: action.controller,
            reviews: [],
            queryParams: {
              ...state.queryParams,
              ...(!!action.queryParams ? action.queryParams : {}),
            },
          };
        case "fetchMoreReviewsStart":
          return {
            ...state,
            status: STATUS.FETCHING_MORE_REVIEWS,
            controller: action.controller,
          };
        default:
          throw new Error(
            `Unexpected event ${action.type} sent to the '${STATUS.IDLE}' state.`
          );
      }
    case STATUS.HAS_FETCHED_ALL_REVIEWS:
      switch (action.type) {
        case "fetchReviewsStart":
          return {
            ...state,
            status: STATUS.FETCHING_REVIEWS,
            controller: action.controller,
            reviews: [],
            queryParams: {
              ...state.queryParams,
              ...(!!action.queryParams ? action.queryParams : {}),
            },
          };
        default:
          throw new Error(
            `Unexpected event ${action.type} sent to the '${STATUS.HAS_FETCHED_ALL_REVIEWS}' state.`
          );
      }

    default:
      return state;
  }
}
