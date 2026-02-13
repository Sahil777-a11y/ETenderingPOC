import ETenderingDataAPI from "../eTenderingApi";

const extendedDataAPI = ETenderingDataAPI.injectEndpoints({
  endpoints: (build) => ({
    getAllTemplates: build.query<any, void>({
      query: () => ({
        url: `/templates`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllTemplatesQuery,
} = extendedDataAPI;

export default extendedDataAPI;
