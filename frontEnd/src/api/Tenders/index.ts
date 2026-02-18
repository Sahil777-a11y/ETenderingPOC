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

export interface VendorTenderListItem {
  tenderId: string;
  name: string;
  startDate: string;
  endDate: string;
  templateType: string;
  status: "Not Submitted" | "In Progress" | "Submitted" | string;
}

export interface GetTendersForVendorParams {
  pageNumber: number;
  pageSize: number;
}

export interface GetTendersForVendorResponse extends ApiResponse<VendorTenderListItem[]> {
  totalRecords: number;
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
  sectionOrder?: number;
  title: string;
  content: string;
  responseType: number;
  properties: unknown;
  acknowledgementStatement: string | boolean;
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
  acknowledgementStatement: string;
  signature: string;
}

export interface UpdateTenderTemplatePayload {
  templateId: string;
  name: string;
  description: string;
  typeId: number;
  sections: UpdateTenderTemplateSectionPayload[];
}

export interface VendorBidTemplateItem {
  tenderTemplateHeaderId: string;
  name: string;
  description: string;
  isCompleted: boolean | null;
  completedDateTime: string | null;
  response: string | null;
}

export interface VendorBidTenderDetail {
  tenderId: string;
  name: string;
  startDate: string;
  endDate: string;
  templateType: string;
  templates: VendorBidTemplateItem[];
}

export type GetVendersBidByTenderIdResponse = ApiResponse<VendorBidTenderDetail>;

export interface VendorResponsePayload {
  tenderTempSectionId: string;
  tenderTemplateHeader: string;
  sectionId: number;
  title: string;
  content: string;
  responseType: number;
  properties: string;
  acknowledgementStatement: string;
  signature: string;
  response?: string | number | boolean | null;
  sectionOrder?: number;
  createdDateTime: string;
  modifiedDateTime: string | null;
}

export interface VendorResponseTemplatePayload {
  tenderTempHeaderId: string;
  tenderHeaderId: string;
  name: string;
  description: string;
  typeId: number;
  isDeleted: boolean;
  createdDateTime: string;
  modifiedDateTime: string | null;
  sections: VendorResponsePayload[];
}

export interface VendorResponseData {
  resposneId?: string;
  responseId?: string;
  vendorBidId: string;
  tenderTemplateHeaderId: string;
  response: string;
  isCompleted: boolean;
  completedDateTime: string | null;
}

export type GetVendorResponseByTenderTemplateHeaderIdResponse = ApiResponse<VendorResponseData>;

export interface UpsertVendorResponseDetailsPayload {
  tenderTemplarteHeaderId: string;
  response: string;
  isCompleted: boolean;
}

export type UpsertVendorResponseDetailsResponse = ApiResponse<unknown>;

export type UpdateTendorSubmitStatusResponse = ApiResponse<unknown>;

export type DeleteTenderTemplateResponse = ApiResponse<unknown>;
export type GetAllTendersResponse = ApiResponse<TenderListItem[]>;
export type TendersForVendorResponse = GetTendersForVendorResponse;
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

    getTendersForVendor: build.query<TendersForVendorResponse, GetTendersForVendorParams>({
      query: ({ pageNumber, pageSize }) => ({
        url: `/Tender/GetTendersForVendor`,
        method: "GET",
        params: { pageNumber, pageSize },
      }),
      providesTags: ["ETendering_TAG"],
    }),

    getVendersBidByTenderId: build.query<GetVendersBidByTenderIdResponse, string>({
      query: (tenderId) => ({
        url: `/Tender/GetVendersBidByTenderId`,
        method: "GET",
        params: { tenderId },
      }),
      providesTags: ["ETendering_TAG"],
    }),

    getVendorResponseByTenderTemplateHeaderId: build.query<GetVendorResponseByTenderTemplateHeaderIdResponse, string>({
      query: (tenderTemplateHeaderId) => ({
        url: `/Tender/GetVendorResponseByTenderTemplateHeaderId`,
        method: "GET",
        params: { tenderTemplateHeaderId },
      }),
      providesTags: ["ETendering_TAG"],
    }),

    upsertVendorResponseDetails: build.mutation<
      UpsertVendorResponseDetailsResponse,
      UpsertVendorResponseDetailsPayload
    >({
      query: (body) => ({
        url: `/Tender/UpsertVendorResponseDetails`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ETendering_TAG"],
    }),

    updateTendorSubmitStatus: build.mutation<UpdateTendorSubmitStatusResponse, string>({
      query: (tenderId) => ({
        url: `/Tender/UpdateTendorSubmitStatus`,
        method: "POST",
        params: { tenderId },
      }),
      invalidatesTags: ["ETendering_TAG"],
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
  useGetTendersForVendorQuery,
  useGetVendersBidByTenderIdQuery,
  useGetVendorResponseByTenderTemplateHeaderIdQuery,
  useUpsertVendorResponseDetailsMutation,
  useUpdateTendorSubmitStatusMutation,
  useCreateTenderMutation,
  useDeleteTenderTemplateByIdMutation,
  useGetTenderTemplateForPreviewQuery,
  useLazyGetTenderTemplateForPreviewQuery,
  useUpdateTenderTemplateMutation,
} = extendedDataAPI;


export default extendedDataAPI;
