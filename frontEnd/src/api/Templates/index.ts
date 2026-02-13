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



export type GetAllTemplatesResponse = ApiResponse<TemplateListItem[]>;
export type GetAllTemplateTypesResponse = ApiResponse<TemplateType[]>;

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

    createTemplate: build.mutation<any, any>({
      query: (body) => ({
        url: "Template/UpsertTemplate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ETendering_TAG"],
    }),

    updateTemplate: build.mutation<any, any>({
      query: (body) => ({
        url: "Template/UpsertTemplate",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ETendering_TAG"],
    }),

    deleteTemplate: build.mutation<any, string>({
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
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = extendedDataAPI;


export default extendedDataAPI;
