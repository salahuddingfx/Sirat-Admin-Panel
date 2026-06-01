import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { fetchCategories, deleteCategory, createCategory, updateCategory } from "../../../lib/api/queries";
import { Button, Card, SectionHeader } from "../../../components/ui";
import { triggerAdminToast } from "../../../components/ui/AdminToast";
import { triggerAdminConfirm } from "../../../components/ui/AdminConfirm";
import "./CategoriesPage.css";

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = async (signal) => {
    try {
      const response = await fetchCategories({ signal });
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error("Failed to load categories:", err);
        triggerAdminToast("Failed to load categories", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadCategories(controller.signal);
    return () => controller.abort();
  }, []);

  const handleDelete = async (id) => {
    triggerAdminConfirm("Are you sure you want to delete this category? Products in this category will not be deleted, but they won't show in filtering.", async () => {
      try {
        setIsProcessing(true);
        const response = await deleteCategory(id);
        if (response.success) {
          loadCategories();
          triggerAdminToast("Category deleted successfully", "success");
        }
      } catch (err) {
        console.error("Failed to delete category:", err);
        triggerAdminToast("Failed to delete category", "error");
      } finally {
        setIsProcessing(false);
      }
    });
  };

  if (loading) return <div className="loading-state">Loading categories...</div>;

  return (
    <div className="categories-page">
      <SectionHeader
        eyebrow="Taxonomy"
        title="Product Categories"
        description="Manage storefront category tags and main banner image grids."
      >
        <Button onClick={() => { setEditingCategory(null); setShowModal(true); }}>
          <Plus size={18} /> Add Category
        </Button>
      </SectionHeader>

      <div className="categories-grid">
        {categories?.map((cat) => (
          <Card key={cat._id} className="admin-category-card">
            <div className="category-image">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} />
              ) : (
                <div className="image-placeholder"><ImageIcon size={40} /></div>
              )}
            </div>
            <div className="category-info">
              <h3>{cat.name}</h3>
              <div className="actions">
                <Button variant="ghost" onClick={() => { setEditingCategory(cat); setShowModal(true); }}>
                  <Edit2 size={16} />
                </Button>
                <Button variant="ghost" className="delete-btn" onClick={() => handleDelete(cat._id)} disabled={isProcessing}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <CategoryModal 
          category={editingCategory} 
          onClose={() => setShowModal(false)} 
          onRefresh={loadCategories} 
        />
      )}
    </div>
  );
}

function CategoryModal({ category, onClose, onRefresh }) {
  const [name, setName] = useState(category?.name || "");
  const [image, setImage] = useState(null);
  const [featured, setFeatured] = useState(category?.featured || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("featured", String(featured));
    if (image) {
      formData.append("image", image);
    } else if (!category) {
      triggerAdminToast("Image is required for new categories", "warning");
      setIsSubmitting(false);
      return;
    }

    try {
      let response;
      if (category) {
        response = await updateCategory(category._id, formData);
        if (response.success) triggerAdminToast("Category updated", "success");
      } else {
        response = await createCategory(formData);
        if (response.success) triggerAdminToast("Category created", "success");
      }

      if (response.success) {
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error("Submission error:", err);
      triggerAdminToast("Failed to save category", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{category ? "Edit Category" : "Add New Category"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Banner Image</label>
            <input 
              type="file" 
              onChange={e => setImage(e.target.files[0])} 
              required={!category}
            />
          </div>
          <div className="form-group form-inline">
            <label>Featured</label>
            <label className="toggle-switch" aria-label="Featured toggle">
              <input
                type="checkbox"
                checked={featured}
                onChange={e => setFeatured(e.target.checked)}
              />
              <span className="toggle-track">
                <span className="toggle-knob" />
              </span>
            </label>
          </div>
          <div className="modal-actions">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (category ? "Update Category" : "Create Category")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
