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

export interface TenderTemplatePreviewSection {
  tenderTempSectionId: string;
  tenderTemplateHeader: string;
  sectionId: number;
  title: string;
  content: string;
  responseType: number;
  properties: unknown;
  acknowledgementStatement: boolean;
  signature: string | null;
  createdDateTime: string;
  modifiedDateTime: string | null;
}

export interface TenderTemplatePreviewData {
  tenderTempHeaderId: string;
  tenderHeaderId: string;
  name: string;
  description: string;
  typeId: number;
  isDeleted: boolean;
  createdDateTime: string;
  modifiedDateTime: string | null;
  sections: TenderTemplatePreviewSection[];
}

export interface UpdateTenderTemplateSectionPayload {
  id?: string;
  sectionTypeId: number;
  sectionOrder: number;
  title: string;
  content: string;
  responseType: number;
  properties: string;
  acknowledgementStatement: boolean;
  signature: string;
}

export interface UpdateTenderTemplatePayload {
  templateId: string;
  name: string;
  description: string;
  typeId: number;
  sections: UpdateTenderTemplateSectionPayload[];
}

export type DeleteTenderTemplateResponse = ApiResponse<unknown>;
export type GetAllTendersResponse = ApiResponse<TenderListItem[]>;
export type CreateTenderResponse = ApiResponse<TenderMappedTemplate[]>;
export type GetTenderTemplateForPreviewResponse = ApiResponse<TenderTemplatePreviewData>;
export type UpdateTenderTemplateResponse = ApiResponse<unknown>;

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

    getTenderTemplateForPreview: build.query<GetTenderTemplateForPreviewResponse, string>({
      query: (tenderTempId) => ({
        url: `Tender/GetTenderTemplateForPreview`,
        method: "GET",
        params: { tenderTempId },
      }),
      providesTags: ["ETendering_TAG"],
    }),

    updateTenderTemplate: build.mutation<UpdateTenderTemplateResponse, UpdateTenderTemplatePayload>({
      query: (body) => ({
        url: `/tender/updateTenderTemplate`,
        method: "POST",
        body,
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
  useGetTenderTemplateForPreviewQuery,
  useLazyGetTenderTemplateForPreviewQuery,
  useUpdateTenderTemplateMutation,
} = extendedDataAPI;


export default extendedDataAPI;
