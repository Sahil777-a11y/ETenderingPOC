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

export interface CreateTenderPayload {
  name: string;
  startDate: string;
  endDate: string;
  typeId: number;
}

export interface TenderMappedTemplate {
  id: string;
  name: string;
}

export type DeleteTenderTemplateResponse = ApiResponse<unknown>;
export type GetAllTendersResponse = ApiResponse<TenderListItem[]>;
export type CreateTenderResponse = ApiResponse<TenderMappedTemplate[]>;

const extendedDataAPI = ETenderingDataAPI.injectEndpoints({
  endpoints: (build) => ({
    getAllTenders: build.query<GetAllTendersResponse, void>({
      query: () => ({
        url: `/Tender/GetAllTenders`,
        method: "GET",
      }),
      providesTags: ["ETendering_TAG"],
    }),

    createTender: build.mutation<CreateTenderResponse, CreateTenderPayload>({
      query: (body) => ({
        url: `Tender/CreateTender`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ETendering_TAG"],
    }),

    deleteTenderTemplateById: build.mutation<DeleteTenderTemplateResponse, string>({
      query: (tenderTempId) => ({
        url: `Tender/DeleteTenderTemplateById`,
        method: "POST",
        params: { tenderTempId },
      }),
      invalidatesTags: ["ETendering_TAG"],
    }),



  }),
  overrideExisting: false,

});

export const {
  useGetAllTendersQuery,
  useCreateTenderMutation,
  useDeleteTenderTemplateByIdMutation,
} = extendedDataAPI;


export default extendedDataAPI;
