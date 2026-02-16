import { useMemo } from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import MainLayout from "../../MainLayout";
import {
  useGetTenderTemplateForPreviewQuery,
  type TenderTemplatePreviewSection,
} from "../../api/Tenders";
import PreviewPanel from "../templates/createTemplate/builderStep/PreviewPanel";
import type { TemplateBuilderSection } from "../shared/types";
import { ResponseTypeId, SectionTypeId } from "../../constants";

const parseSectionProperties = (properties: unknown) => {
  if (!properties) return undefined;

  if (typeof properties === "string") {
    try {
      return JSON.parse(properties);
    } catch {
      return undefined;
    }
  }

  return properties as TemplateBuilderSection["properties"];
};

const mapSectionType = (sectionId: number) => {
  const normalizedSectionId = Number(sectionId);

  if (normalizedSectionId === 1 || normalizedSectionId === SectionTypeId.Statement) {
    return SectionTypeId.Statement;
  }

  if (normalizedSectionId === 2 || normalizedSectionId === SectionTypeId.Response) {
    return SectionTypeId.Response;
  }

  if (normalizedSectionId === 3 || normalizedSectionId === SectionTypeId.Acknowledgement) {
    return SectionTypeId.Acknowledgement;
  }

  if (normalizedSectionId === 4 || normalizedSectionId === SectionTypeId.ESignature) {
    return SectionTypeId.ESignature;
  }

  return SectionTypeId.Statement;
};

const mapResponseType = (responseType: number) => {
  const normalizedResponseType = Number(responseType);
  const validResponseTypes = [
    ResponseTypeId.Text,
    ResponseTypeId.Numeric,
    ResponseTypeId.List,
  ];

  return validResponseTypes.includes(normalizedResponseType as typeof ResponseTypeId[keyof typeof ResponseTypeId])
    ? (normalizedResponseType as typeof ResponseTypeId[keyof typeof ResponseTypeId])
    : undefined;
};

const PreviewTenderTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tempId } = useParams<{ tempId: string }>();
  const routeState = (location.state as {
    fromCreateTender?: boolean;
    activeStep?: number;
    templates?: { id: string; name: string }[];
  } | null) ?? null;

  const {
    data: previewResponse,
    isLoading,
    isError,
  } = useGetTenderTemplateForPreviewQuery(tempId || "", {
    skip: !tempId,
  });

  const previewSections: TemplateBuilderSection[] = useMemo(() => {
    const sections = previewResponse?.data?.sections ?? [];

    return sections.map((section: TenderTemplatePreviewSection, index: number) => {
      const sectionTypeId = mapSectionType(section.sectionId);

      return {
        id: section.tenderTempSectionId || crypto.randomUUID(),
        sectionTypeId,
        order: index + 1,
        title: section.title || "",
        content: section.content || "",
        responseTypeId:
          sectionTypeId === SectionTypeId.Response
            ? mapResponseType(section.responseType)
            : undefined,
        properties: parseSectionProperties(section.properties),
        acknowledgementStatement:
          sectionTypeId === SectionTypeId.Acknowledgement && section.acknowledgementStatement
            ? "I acknowledge"
            : "",
        signature: section.signature || "",
      };
    });
  }, [previewResponse?.data?.sections]);

  return (
    <MainLayout>
      <Box sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {previewResponse?.data?.name || "Template Preview"}
        </Typography>

        <Box sx={{ mt: 3, flex: 1, minHeight: 0 }}>
          {isLoading && <Typography>Loading template preview...</Typography>}
          {isError && <Typography color="error">Failed to load template preview.</Typography>}
          {!isLoading && !isError && <PreviewPanel sections={previewSections} />}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box display="flex" justifyContent="space-between">
          <Button
            onClick={() => {
              if (routeState?.fromCreateTender) {
                navigate("/tenders/create-tender", {
                  state: {
                    activeStep: routeState.activeStep ?? 1,
                    templates: routeState.templates ?? [],
                  },
                });
                return;
              }

              navigate(-1);
            }}
          >
            BACK
          </Button>
          <Button variant="contained" disabled>
            SAVE
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default PreviewTenderTemplate;
