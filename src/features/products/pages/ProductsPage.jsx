import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, Images } from "lucide-react";
import { fetchProducts, deleteProduct, createProduct, updateProduct, fetchCategories } from "../../../lib/api/queries";
import { Button, Card, SectionHeader, Badge, ImageGallery } from "../../../components/ui";
import { triggerAdminToast } from "../../../components/ui/AdminToast";
import { triggerAdminConfirm } from "../../../components/ui/AdminConfirm";
import { CURRENCY_SYMBOL, UI_STRINGS } from "../../../lib/constants";
import "./ProductsPage.css";

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [galleryProduct, setGalleryProduct] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const loadProducts = async (signal) => {
    try {
      const response = await fetchProducts({ signal });
      if (response.success) {
        setProducts(response.data);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error("Failed to load products:", err);
        triggerAdminToast("Failed to load products", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadProducts(controller.signal);
    return () => controller.abort();
  }, []);

  const handleDelete = async (id) => {
    triggerAdminConfirm("Are you sure you want to delete this product?", async () => {
      try {
        setIsProcessing(true);
        const response = await deleteProduct(id);
        if (response.success) {
          loadProducts();
          triggerAdminToast("Product deleted successfully", "success");
        }
      } catch (err) {
        console.error("Failed to delete product:", err);
        triggerAdminToast("Failed to delete product", "error");
      } finally {
        setIsProcessing(false);
      }
    });
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="products-page">
      <SectionHeader
        eyebrow={UI_STRINGS.products.eyebrow}
        title={UI_STRINGS.products.title}
        description={UI_STRINGS.products.description}
      >
        <Button onClick={() => { setEditingProduct(null); setShowModal(true); }}>
          <Plus size={18} /> {UI_STRINGS.products.addButton}
        </Button>
      </SectionHeader>

      <Card className="orders-card">
        {products?.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <ImageIcon size={48} className="muted" style={{ margin: "0 auto 1rem" }} />
            <h3>{UI_STRINGS.products.noItems}</h3>
            <p className="muted">{UI_STRINGS.products.noItemsDesc}</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Sizes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="product-thumb">
                      {product.images?.[0] ? (
                        <img src={product.images[0]?.url || product.images[0]} alt={product.name || 'Product'} />
                      ) : (
                        <ImageIcon size={18} />
                      )}
                    </div>
                  </td>
                  <td><strong>{product?.name}</strong></td>
                  <td>{product?.category?.name || product?.category || "—"}</td>
                  <td>
                    <span className="price">
                      {product?.oldPrice && product?.oldPrice > product?.price && (
                        <span className="original-price">{CURRENCY_SYMBOL}{product?.oldPrice} </span>
                      )}
                      {CURRENCY_SYMBOL}{product?.price}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                      {product?.variants?.map((v) => {
                        const inStock = v.stock > 0;
                        return (
                        <span key={v._id || v.label} style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.2rem",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          background: inStock ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                          color: inStock ? "#10B981" : "#EF4444"
                        }}>
                          {v.label}
                          <span style={{ opacity: 0.6 }}>{v.stock}</span>
                        </span>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <Badge variant={product?.status === 'Live' ? 'success' : 'warning'}>{product?.status}</Badge>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {product.images?.length > 0 && (
                        <Button variant="ghost" onClick={() => { setGalleryProduct(product); setGalleryIndex(0); }} title="View Images">
                          <Images size={16} />
                        </Button>
                      )}
                      <Button variant="ghost" onClick={() => { setEditingProduct(product); setShowModal(true); }}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" className="delete-btn" onClick={() => handleDelete(product._id)} disabled={isProcessing}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showModal && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setShowModal(false)} 
          onRefresh={loadProducts} 
        />
      )}

      {galleryProduct && (
        <ImageGallery
          images={galleryProduct.images}
          initialIndex={galleryIndex}
          onClose={() => setGalleryProduct(null)}
          alt={galleryProduct.name}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    oldPrice: product?.oldPrice || "",
    costPrice: product?.costPrice || "",
    packagingCost: product?.packagingCost || "",
    managementCost: product?.managementCost || "",
    otherCost: product?.otherCost || "",
    category: product?.category?.name || product?.category || "",
    featured: product?.featured || false,
    status: product?.status || "Live"
  });
  const [variants, setVariants] = useState(
    product?.variants?.length > 0
      ? product.variants.map(v => ({ ...v }))
      : [
          { label: "S", priceDelta: 0, stock: 10 },
          { label: "M", priceDelta: 0, stock: 10 },
          { label: "L", priceDelta: 0, stock: 10 },
          { label: "XL", priceDelta: 100, stock: 5 },
        ]
  );
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await fetchCategories();
        if (res.success) {
          setCategoriesList(res.data);
          if (!product && res.data.length > 0 && !formData.category) {
            setFormData(prev => ({ ...prev, category: res.data[0].name }));
          }
        }
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    };
    loadCats();
  }, [product]);

  const handleRemoveExisting = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setNewImagePreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveNew = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (typeof formData.featured !== 'undefined') {
      data.set('featured', String(formData.featured));
    }
    data.append("keepImages", JSON.stringify(existingImages));
    for (let i = 0; i < newImages.length; i++) {
      data.append("images", newImages[i]);
    }
    data.append("variants", JSON.stringify(variants.filter(v => v.label.trim())));

    try {
      let response;
      if (product) {
        response = await updateProduct(product._id, data);
        if (response.success) triggerAdminToast("Product updated", "success");
      } else {
        response = await createProduct(data);
        if (response.success) triggerAdminToast("New product created", "success");
      }

      if (response.success) {
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error("Submission error:", err);
      triggerAdminToast("Failed to save product", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{product ? "Edit Product" : "Add New Product"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Selling Price (৳)</label>
              <input 
                type="number" 
                required 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Original Price (৳)</label>
              <input 
                type="number" 
                value={formData.oldPrice} 
                onChange={e => setFormData({...formData, oldPrice: e.target.value})} 
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              required 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select 
                required 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {categoriesList.map(c => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Variants (Sizes)</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {/* Row 1: Size labels */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  {variants.map((v, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <input
                        type="text"
                        placeholder="Size"
                        value={v.label}
                        onChange={e => {
                          const updated = [...variants];
                          updated[i] = { ...updated[i], label: e.target.value };
                          setVariants(updated);
                        }}
                        style={{ width: "52px", padding: "0.4rem 0.3rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", textAlign: "center", fontWeight: "700", fontSize: "0.85rem" }}
                      />
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                          style={{ color: "var(--color-error)", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "0.1rem", lineHeight: 1 }}
                          title="Remove size"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setVariants([...variants, { label: "", priceDelta: 0, stock: 0 }])}
                    style={{
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.78rem",
                      background: "var(--color-surface-soft)",
                      border: "1px dashed var(--color-border-strong)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      color: "var(--color-text-muted)",
                      whiteSpace: "nowrap"
                    }}
                  >
                    + Size
                  </button>
                </div>
                {/* Row 2: Stock under each size */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  {variants.map((v, i) => (
                    <input
                      key={i}
                      type="number"
                      placeholder="Stock"
                      value={v.stock}
                      onChange={e => {
                        const updated = [...variants];
                        updated[i] = { ...updated[i], stock: parseInt(e.target.value) || 0 };
                        setVariants(updated);
                      }}
                      style={{ width: "68px", padding: "0.4rem 0.5rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: "0.85rem" }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Cost Price (৳)</label>
              <input 
                type="number" 
                value={formData.costPrice} 
                onChange={e => setFormData({...formData, costPrice: e.target.value})} 
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label>Packaging Cost (৳)</label>
              <input 
                type="number" 
                value={formData.packagingCost} 
                onChange={e => setFormData({...formData, packagingCost: e.target.value})} 
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label>Management Cost (৳)</label>
              <input 
                type="number" 
                value={formData.managementCost} 
                onChange={e => setFormData({...formData, managementCost: e.target.value})} 
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label>Other Cost (৳)</label>
              <input 
                type="number" 
                value={formData.otherCost} 
                onChange={e => setFormData({...formData, otherCost: e.target.value})} 
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Live">Live</option>
                <option value="Alert">Alert</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <div className="form-group form-inline">
              <label>Featured</label>
              <label className="toggle-switch" aria-label="Featured toggle">
                <input
                  type="checkbox"
                  checked={!!formData.featured}
                  onChange={e => setFormData({...formData, featured: e.target.checked})}
                />
                <span className="toggle-track">
                  <span className="toggle-knob" />
                </span>
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Images</label>
            {existingImages.length > 0 && (
              <div className="image-preview-grid">
                {existingImages.map((url, i) => (
                  <div key={i} className="image-preview-item">
                    <img src={url} alt={`${product?.name || "Product"} image ${i + 1}`} />
                    <button
                      type="button"
                      className="image-preview-remove"
                      onClick={() => handleRemoveExisting(i)}
                      title="Remove image"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            {newImagePreviews.length > 0 && (
              <div className="image-preview-grid">
                {newImagePreviews.map((url, i) => (
                  <div key={`new-${i}`} className="image-preview-item">
                    <img src={url} alt={`${product?.name || "New product"} preview ${i + 1}`} />
                    <button
                      type="button"
                      className="image-preview-remove"
                      onClick={() => handleRemoveNew(i)}
                      title="Remove image"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleNewImagesChange} 
            />
          </div>
          <div className="modal-actions">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (product ? "Update Product" : "Create Product")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
