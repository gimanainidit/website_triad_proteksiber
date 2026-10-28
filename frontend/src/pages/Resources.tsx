import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge, Button } from "@/components/ds";
import type { Resource } from "@/types/resource";
import { ResourceService } from "@/services/resourceService";

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const data = await ResourceService.getAllResources();
        setResources(data);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const data = await ResourceService.getCategories();
        setCategories(data.categories);
      } catch (error) {
        console.error(error);
      }
    };

    fetchResources();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = resources;
    if (searchQuery) {
      filtered = filtered.filter((resource) =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((resource) => resource.category === selectedCategory);
    }

    setFilteredResources(filtered);
  }, [resources, searchQuery, selectedCategory]);

  const stats = useMemo(
    () => ({
      total: resources.length,
      categories: categories.length,
      results: filteredResources.length,
    }),
    [resources.length, categories.length, filteredResources.length]
  );

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return "📄";
      case "pptx":
      case "ppt":
        return "📊";
      case "docx":
      case "doc":
        return "📝";
      default:
        return "📁";
    }
  };

  const handleDownload = (fileUrl: string, title: string) => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = title;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="px-4 py-12">
        <section className="py-14">
          <div className="max-w-6xl mx-auto">
            <motion.h1 className="text-heading-1 mb-3 text-ink-strong" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              Resource Center
            </motion.h1>
            <p className="text-subtitle text-steel">
              Temukan materi edukasi keamanan siber terbaru dari tim TRIAD PRO-TX SIBER.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto space-y-10">
          <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
            <div className="flex items-center gap-3 rounded-xl border border-hairline bg-canvas p-4">
              <Search className="h-5 w-5 text-steel" aria-hidden="true" />
              <Input
                placeholder="Cari resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent focus:ring-0"
              />
            </div>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value || "all")}> 
              <SelectTrigger className="h-14">
                <SelectValue placeholder="Semua kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardStat label="Total" value={stats.total} icon={<BookOpen />} />
            <CardStat label="Kategori" value={stats.categories} icon={<Filter />} />
            <CardStat label="Hasil" value={stats.results} icon={<Download />} />
          </div>

          <div className="space-y-6">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex flex-col gap-6 rounded-xl border border-hairline bg-canvas p-6 md:flex-row"
              >
                <div className="h-16 w-16 rounded-xl bg-soft flex items-center justify-center text-3xl">
                  {getFileIcon(resource.file_type)}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="soft">{resource.category}</Badge>
                    <span className="text-xs text-steel">{resource.file_size}</span>
                  </div>
                  <h3 className="text-heading-5 text-ink-strong">{resource.title}</h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-steel">
                    {resource.description}
                  </p>
                </div>
                <div className="flex flex-col gap-2 justify-between">
                  <Button expand={false} onClick={() => handleDownload(resource.file_url, resource.title)}>
                    <Download className="h-4 w-4" aria-hidden="true" /> Download
                  </Button>
                  <Button variant="secondary" expand={false} asChild>
                    <a href={`/resources/${resource.id}`}>Lihat detail</a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

    </div>
  )
}

const CardStat = ({ label, value, icon }: { label: string; value: number; icon: JSX.Element }) => (
  <div className="flex items-center gap-3 rounded-xl border border-hairline bg-canvas p-5">
    <div className="text-2xl text-shield" aria-hidden="true">{icon}</div>
    <div>
      <p className="text-heading-3 text-ink-strong">{value}</p>
      <p className="text-eyebrow text-steel">{label}</p>
    </div>
  </div>
)

export default Resources;
