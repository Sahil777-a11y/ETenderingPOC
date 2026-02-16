import ETenderingDataAPI from "../eTenderingApi";

export interface ApiResponse<T> {
  id: number;
  success: boolean;
  message: string;
  data: T;
  alertType: string | null;
  metaData: unknown;
}

export interface TenderListItem {
  tenderHeaderId: string;
  name: string;
  startDate: string;
  endDate: string;
  typeId: number;
  typeName?: string;
  createdDateTime: string;
  modifiedDateTime: string | null;
}




export type GetAllTendersResponse = ApiResponse<TenderListItem[]>;

const extendedDataAPI = ETenderingDataAPI.injectEndpoints({
  endpoints: (build) => ({
    getAllTenders: build.query<GetAllTendersResponse, void>({
      query: () => ({
        url: `/Tender/GetAllTenders`,
        method: "GET",
      }),
      providesTags: ["ETendering_TAG"],
    }),

    

  }),
  overrideExisting: false,

});

export const {
  useGetAllTendersQuery,
} = extendedDataAPI;


export default extendedDataAPI;
