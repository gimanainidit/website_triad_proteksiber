import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Mail, Shield, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section className="bg-hero-gradient text-dark-foreground py-16 relative">
          <div className="max-w-7xl mx-auto px-6">
            <motion.h1
              className="text-4xl md:text-5xl font-serif font-black mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Hubungi Kami
            </motion.h1>
            <p className="text-dark-foreground/70 text-lg max-w-xl">
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
                  <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                  <h2 className="text-2xl font-serif font-bold mb-2 text-foreground">Pesan Terkirim!</h2>
                  <p className="text-muted-foreground">Tim kami akan menghubungi Anda dalam 1-2 hari kerja.</p>
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
                            <FormLabel className="text-sm font-normal text-muted-foreground cursor-pointer">
                              Saya menyetujui bahwa data yang saya berikan akan digunakan untuk menghubungi saya terkait layanan TRIAD PRO-TX SIBER.
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg glow-hover"
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
              <div className="bg-card border border-border rounded-lg p-8 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-accent" />
                  <h3 className="font-serif font-bold text-lg text-card-foreground">Informasi Kontak</h3>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-accent shrink-0" />
                    <a href="mailto:triad-proteksiber@pm.me" className="text-muted-foreground hover:text-accent transition-colors">
                      triad-proteksiber@pm.me
                    </a>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Tim Kami</h4>
                  {[
                    { name: "Mochamad Iqbal Fawzan", role: "Partner, IT Strategy & Digital Transformation" },
                    { name: "Erlangga Putera", role: "Partner, Cybersecurity Infrastructure & Architecture" },
                    { name: "Adhitya Jiwa Pratama", role: "Partner, Cyber Security Compliance & GRC" },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-accent">{p.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.role}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-secondary rounded-lg text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Privasi:</strong> Data Anda dilindungi dan hanya digunakan untuk keperluan komunikasi bisnis. Kami tidak membagikan informasi Anda kepada pihak ketiga.
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
