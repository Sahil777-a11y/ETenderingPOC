import ETenderingDataAPI from "../eTenderingApi";

export interface ApiResponse<T> {
  id: number;
  success: boolean;
  message: string;
  data: T;
  alertType: string | null;
  metaData: unknown;
}

export interface TemplateSection {
  sectionUniqueId: string;
  sectionId: number;
  title: string;
  content: string;
  responseType: number;
  sectionOrder: number;
  properties: unknown;
  acknowledgementStatement: boolean;
  sectionCreatedDateTime: string;
  sectionModifiedDateTime: string | null;
}

export interface TemplateType {
  id: number;
  name: string;
}

export interface TemplateListItem {
  templateId: string;
  templateName: string;
  description: string;
  typeId: number;
  isDeleted: boolean;
  templateCreatedDateTime: string;
  templateModifiedDateTime: string | null;
  sections: TemplateSection[];
}

export interface UpsertTemplateSectionPayload {
  sectionTypeId: number;
  sectionOrder: number;
  title: string;
  content: string;
  responseType: number;
  properties: string;
  acknowledgementStatement: boolean;
  signature: string;
}

export interface UpsertTemplatePayload {
  templateId?: string;
  name: string;
  description: string;
  typeId: number;
  sections: UpsertTemplateSectionPayload[];
}



export type GetAllTemplatesResponse = ApiResponse<TemplateListItem[]>;
export type GetAllTemplateTypesResponse = ApiResponse<TemplateType[]>;
export type GetTemplateByIdResponse = ApiResponse<TemplateListItem>;
export type UpsertTemplateResponse = ApiResponse<unknown>;

const extendedDataAPI = ETenderingDataAPI.injectEndpoints({
  endpoints: (build) => ({
    getAllTemplates: build.query<GetAllTemplatesResponse, void>({
      query: () => ({
        url: `/Template/GetAllTemplates`,
        method: "GET",
      }),
      providesTags: ["ETendering_TAG"],
    }),

    getAllTemplateTypes: build.query<GetAllTemplateTypesResponse, void>({
      query: () => ({
        url: `/Template/GetAllTemplateTypes`,
        method: "GET",
      }),
      providesTags: ["ETendering_TAG"],
    }),

    getTemplateByTemplateId: build.query<GetTemplateByIdResponse, string>({
      query: (templateId) => ({
        url: `/Template/GetTemplateByTemplateId`,
        method: "GET",
        params: { templateId },
      }),
      providesTags: ["ETendering_TAG"],
    }),

    createTemplate: build.mutation<UpsertTemplateResponse, UpsertTemplatePayload>({
      query: (body) => ({
        url: "Template/UpsertTemplate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ETendering_TAG"],
    }),

    updateTemplate: build.mutation<UpsertTemplateResponse, UpsertTemplatePayload>({
      query: (body) => ({
        url: "Template/UpsertTemplate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ETendering_TAG"],
    }),

    deleteTemplate: build.mutation<ApiResponse<unknown>, string>({
      query: (templateId) => ({
        url: "Template/DeleteTemplateByTemplateId",
        method: "DELETE",
        params: { templateId },
      }),
      invalidatesTags: ["ETendering_TAG"],
    }),


  }),
  overrideExisting: false,

});

export const {
  useGetAllTemplatesQuery,
  useGetAllTemplateTypesQuery,
  useGetTemplateByTemplateIdQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = extendedDataAPI;


export default extendedDataAPI;
