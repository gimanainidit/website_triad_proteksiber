import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Mail, Shield, CheckCircle } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ds";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi").max(100),
  perusahaan: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().trim().email("Format email tidak valid").max(255),
  telepon: z.string().trim().max(20).optional().or(z.literal("")),
  subjek: z.string().trim().min(1, "Subjek wajib diisi").max(200),
  pesan: z.string().trim().min(20, "Pesan minimal 20 karakter").max(2000),
  consent: z.boolean().refine((v) => v === true, "Anda harus menyetujui kebijakan privasi"),
  honeypot: z.string().max(0).optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      nama: "",
      perusahaan: "",
      email: "",
      telepon: "",
      subjek: "",
      pesan: "",
      consent: false,
      honeypot: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    // Honeypot check
    if (data.honeypot) return;
    
    // For now, show success (backend integration needed for actual email delivery)
    console.log("Contact form submitted:", { ...data, honeypot: undefined });
    setSubmitted(true);
    toast({
      title: "Pesan Terkirim!",
      description: "Terima kasih, tim kami akan menghubungi Anda segera.",
    });
  };

  return (
    <div>
      <div>
        {/* Hero */}
        <section className="bg-navy-950 py-16 text-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <motion.h1
              className="text-heading-1 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Hubungi Kami
            </motion.h1>
            <p className="max-w-xl text-subtitle text-on-dark-muted">
              Konsultasikan kebutuhan keamanan siber organisasi Anda dengan tim ahli kami.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12">
            {/* Form */}
            <div className="md:col-span-7">
              {submitted ? (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle className="mx-auto mb-4 h-16 w-16 text-shield" aria-hidden="true" />
                  <h2 className="mb-2 text-heading-4 text-ink-strong">Pesan Terkirim!</h2>
                  <p className="text-steel">Tim kami akan menghubungi Anda dalam 1-2 hari kerja.</p>
                </motion.div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Honeypot */}
                    <div className="hidden" aria-hidden="true">
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        {...form.register("honeypot")}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="nama"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nama lengkap" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="perusahaan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Perusahaan</FormLabel>
                            <FormControl>
                              <Input placeholder="Nama perusahaan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@contoh.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="telepon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telepon</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+62 812 xxxx xxxx" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subjek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subjek *</FormLabel>
                          <FormControl>
                            <Input placeholder="Topik pesan Anda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pesan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pesan * (min. 20 karakter)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Jelaskan kebutuhan keamanan siber Anda..."
                              className="min-h-[140px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <FormItem className="flex items-start gap-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="cursor-pointer text-sm font-normal text-steel">
                              Saya menyetujui bahwa data yang saya berikan akan digunakan untuk menghubungi saya terkait layanan TRIAD PRO-TX SIBER.
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      expand={false}
                      className="w-full sm:w-auto"
                      disabled={form.formState.isSubmitting}
                    >
                      <Send size={16} />
                      {form.formState.isSubmitting ? "Mengirim..." : "Kirim Pesan"}
                    </Button>
                  </form>
                </Form>
              )}
            </div>

            {/* Sidebar */}
            <aside className="md:col-span-5">
              <div className="sticky top-24 rounded-xl border border-hairline bg-canvas p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="h-8 w-8 text-shield" aria-hidden="true" />
                  <h3 className="text-heading-5 text-ink-strong">Informasi Kontak</h3>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="shrink-0 text-shield" aria-hidden="true" />
                    <a href="mailto:triad-proteksiber@pm.me" className="text-link hover:underline">
                      triad-proteksiber@pm.me
                    </a>
                  </div>
                </div>

                <div className="mt-8 border-t border-hairline pt-6">
                  <h4 className="mb-4 text-eyebrow text-steel">Tim Kami</h4>
                  {[
                    { name: "Mochamad Iqbal Fawzan", role: "Partner, IT Strategy & Digital Transformation" },
                    { name: "Erlangga Putera", role: "Partner, Cybersecurity Infrastructure & Architecture" },
                    { name: "Adhitya Jiwa Pratama", role: "Partner, Cyber Security Compliance & GRC" },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-soft flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">{p.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink-strong">{p.name}</p>
                        <p className="text-xs text-steel">{p.role}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg bg-soft p-4 text-xs leading-relaxed text-ink">
                  <strong className="text-ink-strong">Privasi:</strong> Data Anda dilindungi dan hanya digunakan untuk keperluan komunikasi bisnis. Kami tidak membagikan informasi Anda kepada pihak ketiga.
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
