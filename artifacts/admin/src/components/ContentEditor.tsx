import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "../lib/api";
import { PageHeader, Card, Button, Input, TextArea, Skeleton } from "../components/ui";
import { Save, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import type { ReactNode } from "react";

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "url" | "email";
  placeholder?: string;
  required?: boolean;
  section?: string;
}

interface ContentEditorProps {
  title: string;
  description: string;
  icon?: ReactNode;
  apiEndpoint: string;
  queryKey: string;
  fields: FieldDef[];
}

export default function ContentEditor({ title, description, icon, apiEndpoint, queryKey, fields }: ContentEditorProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => apiGet(apiEndpoint),
  });

  useEffect(() => {
    if (data) {
      const initial: Record<string, string> = {};
      fields.forEach((f) => {
        initial[f.key] = data[f.key] || "";
      });
      setFormData(initial);
      setIsDirty(false);
    }
  }, [data, fields]);

  const mutation = useMutation({
    mutationFn: (body: Record<string, string>) => apiPut(apiEndpoint, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success("Content saved successfully!");
      setIsDirty(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save");
    },
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleReset = () => {
    if (data) {
      const initial: Record<string, string> = {};
      fields.forEach((f) => {
        initial[f.key] = data[f.key] || "";
      });
      setFormData(initial);
      setIsDirty(false);
    }
  };

  // Group fields by section
  const sections = new Map<string, FieldDef[]>();
  fields.forEach((f) => {
    const sec = f.section || "General";
    if (!sections.has(sec)) sections.set(sec, []);
    sections.get(sec)!.push(f);
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title={title} description={description} />
        <Card>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex gap-2">
            {isDirty && (
              <Button variant="secondary" onClick={handleReset} size="sm">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            )}
            <Button onClick={handleSubmit} loading={mutation.isPending} size="sm" disabled={!isDirty}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {[...sections.entries()].map(([sectionName, sectionFields]) => (
          <Card key={sectionName}>
            {sections.size > 1 && (
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                {icon}
                {sectionName}
              </h3>
            )}
            <div className="space-y-4">
              {sectionFields.map((field) =>
                field.type === "textarea" ? (
                  <TextArea
                    key={field.key}
                    label={field.label}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                  />
                ) : (
                  <Input
                    key={field.key}
                    label={field.label}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                  />
                )
              )}
            </div>
          </Card>
        ))}
      </form>
    </div>
  );
}
