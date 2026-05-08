import { gql } from '@apollo/client';

// gql is a tagged template literal that parses GraphQL query strings
// into an AST (Abstract Syntax Tree) that Apollo understands.
// This is NOT a plain string — it's a parsed document object.

// GET_PHOTOS fetches a paginated list of photos.
// We only request: id, title, url, thumbnailUrl, albumId
// This is GraphQL's over-fetching prevention in action —
// the API has more fields but we only pay for what we ask for.
export const GET_PHOTOS = gql`
  query GetPhotos($options: PageQueryOptions) {
    photos(options: $options) {
      data {
        id
        title
        url
        thumbnailUrl
        album {
          id
          title
          user {
            name
            username
          }
        }
      }
      meta {
        totalCount
      }
    }
  }
`;

// GET_PHOTO fetches a single photo by ID for the Details screen.
// Separate query for the detail view — we don't want to over-fetch
// list data for a page that only shows one item.
export const GET_PHOTO = gql`
  query GetPhoto($id: ID!) {
    photo(id: $id) {
      id
      title
      url
      thumbnailUrl
      album {
        id
        title
      }
    }
  }
`;
