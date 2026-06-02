import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import { fetchHeroSlides, deleteHeroSlide, createHeroSlide, updateHeroSlide } from "../../../lib/api/queries";
import { Button, Input, Card, SectionHeader } from "../../../components/ui";
import { triggerAdminToast } from "../../../components/ui/AdminToast";
import { triggerAdminConfirm } from "../../../components/ui/AdminConfirm";
import "./HeroPage.css";

export default function HeroPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);

  const loadSlides = async (signal) => {
    try {
      const res = await fetchHeroSlides({ signal });
      if (res.success) setSlides(res.data);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error(err);
        triggerAdminToast("Failed to load hero slides", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadSlides(controller.signal);
    return () => controller.abort();
  }, []);

  const handleDelete = async (id) => {
    triggerAdminConfirm("Are you sure you want to delete this slide?", async () => {
        try {
          setIsProcessing(true);
          await deleteHeroSlide(id);
          setSlides(slides.filter((s) => s._id !== id));
          triggerAdminToast("Slide deleted successfully", "success");
        } catch (err) {
          triggerAdminToast("Failed to delete slide", "error");
        } finally {
          setIsProcessing(false);
        }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("image", imageFile || currentSlide?.image || "");
    fd.append("title", e.target.title.value);
    fd.append("subtitle", e.target.subtitle.value || "");
    fd.append("description", e.target.description.value || "");
    fd.append("actionText", e.target.actionText.value || "Shop Now");
    fd.append("link", e.target.link.value || "/shop");
    fd.append("order", parseInt(e.target.order.value) || 0);
    fd.append("isActive", e.target.isActive.checked ? "true" : "false");

    if (!currentSlide && !imageFile) {
      triggerAdminToast("Please select an image", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentSlide) {
        await updateHeroSlide(currentSlide._id, fd);
        triggerAdminToast("Slide updated", "success");
      } else {
        await createHeroSlide(fd);
        triggerAdminToast("Slide created", "success");
      }
      setIsModalOpen(false);
      setImageFile(null);
      setImagePreview(null);
      loadSlides();
    } catch (err) {
      console.error("Failed to save slide:", err);
      const msg = err.response?.data?.message || err.message || "Failed to save slide";
      triggerAdminToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page hero-page">
      <SectionHeader
        title="Hero Slider"
        description="Manage the main homepage visuals and banners."
      >
        <Button onClick={() => { setCurrentSlide(null); setIsModalOpen(true); }}>
          <Plus size={18} /> Add New Slide
        </Button>
      </SectionHeader>

      <div className="grid-container" style={{ marginTop: "2rem" }}>
        {loading ? (
          <p>Loading slides...</p>
        ) : slides.length === 0 ? (
          <p>No slides found.</p>
        ) : (
          <div className="products-list">
            {slides.map((slide) => (
              <Card key={slide._id} className="product-card">
                <div className="hero-slide-card">
                  <div className="hero-slide-preview">
                    {slide.image ? (
                      <img src={slide.image} alt={slide.title} />
                    ) : (
                      <ImageIcon size={24} />
                    )}
                  </div>
                  <div className="hero-slide-content">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                        <h4 style={{ margin: 0 }}>{slide.title}</h4>
                        <span className={`badge ${slide.isActive ? "badge-success" : "badge-outline"}`}>
                            {slide.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <p className="muted" style={{ fontSize: "0.875rem", margin: "0.5rem 0" }}>{slide.subtitle}</p>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                      <Button variant="outline" size="sm" onClick={() => { setCurrentSlide(slide); setIsModalOpen(true); }}>
                        <Edit2 size={14} /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(slide._id)} style={{ color: "var(--color-error)" }} disabled={isProcessing}>
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsModalOpen(false); setImageFile(null); setImagePreview(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{currentSlide ? "Edit Slide" : "Add New Slide"}</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
              {/* Image Upload */}
              <div className="form-group">
                <label>Slide Image</label>
                <div className="hero-upload-area" onClick={() => fileRef.current?.click()} style={{
                  border: "2px dashed var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "2rem 1rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: imagePreview ? "transparent" : "var(--color-surface-soft)",
                  position: "relative",
                  minHeight: "140px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ maxHeight: "200px", borderRadius: "var(--radius-sm)", objectFit: "contain" }} />
                  ) : currentSlide?.image ? (
                    <img src={currentSlide.image} alt="Current" style={{ maxHeight: "200px", borderRadius: "var(--radius-sm)", objectFit: "contain" }} />
                  ) : (
                    <div style={{ color: "var(--color-text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                      <Upload size={24} />
                      <span style={{ fontSize: "0.85rem" }}>Click to upload image</span>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </div>
              <Input label="Title" name="title" defaultValue={currentSlide?.title} required />
              <Input label="Subtitle" name="subtitle" defaultValue={currentSlide?.subtitle} />
              <Input label="Description" name="description" defaultValue={currentSlide?.description} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input label="Button Text" name="actionText" defaultValue={currentSlide?.actionText || "Shop Now"} />
                <Input label="Link" name="link" defaultValue={currentSlide?.link || "/shop"} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input label="Order" name="order" type="number" defaultValue={currentSlide?.order || 0} />
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                  <input type="checkbox" name="isActive" defaultChecked={currentSlide ? currentSlide.isActive : true} /> Active
                </label>
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setImageFile(null); setImagePreview(null); }}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Slide"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
