/**
 * Company Form Component.
 *
 * This component provides a form for adding a new company tracker entry.
 * It manages the state for all form input fields.
 * It handles form submission, sending the data to the custom
 * '/wp-json/nexus/v1/companies' REST API endpoint using the POST method.
 * It uses the `useApi` hook for authenticated API submission.
 * It includes loading, error, and success states, and calls callbacks on success or cancel.
 */
import React, { useState } from 'react'; // Import useState hook
import useApi from '../hooks/useApi'; // Import the custom useApi hook

// Define the interface for the component's props
interface CompanyFormProps {
  // Optional callback function to be called after a company is successfully created.
  // This can be used by the parent component to refresh a list or change the view.
  onCompanyCreated?: () => void;
  // Optional callback function to be called when the user cancels the form.
  onCancel?: () => void;
}

/**
 * Renders a form to add a new company tracker entry.
 * @param {CompanyFormProps} props - The component's props.
 */
const CompanyForm: React.FC<CompanyFormProps> = ({ onCompanyCreated, onCancel }) => {
  // State to manage the values of the form input fields.
  // Initialize with empty strings or default values based on your schema.
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    document_number: '',
    email: '',
    phone: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    website: '',
    notes: '',
    status: 1, // Default status to 'Active' (assuming 1 = active)
    default_flat_fee: '0.00' // Default fee, using string for the number input value
  });

  // State to indicate if the form submission is currently in progress.
  const [loading, setLoading] = useState(false);
  // State to hold any error message that occurs during submission.
  const [error, setError] = useState<string | null>(null);
  // State to hold a success message after successful submission.
  const [success, setSuccess] = useState<string | null>(null);

  // Get the apiFetch function from your custom useApi hook.
  const { apiFetch } = useApi();

  /**
   * Handles changes to the form input fields.
   * Updates the corresponding state property in formData.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} event - The input change event.
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;

    // Handle specific input types if necessary before updating state.
    // For example, ensure number inputs store numeric values, or checkboxes store booleans.
    // For the 'status' select element, value is a string ('0' or '1'), which is fine for sending to the API.
    // For the 'default_flat_fee' number input, value is also a string. Ensure it's passed as string to state.
     const finalValue = (type === 'number' || name === 'default_flat_fee') ? String(value) : value;

    // Update the formData state. Use the spread operator (...) to copy existing data,
    // then override the property corresponding to the input's 'name'.
    setFormData(prevState => ({
      ...prevState,
      [name]: finalValue // [name] uses the input's 'name' attribute as the key
    }));
  };

  /**
   * Handles the form submission event.
   * Sends the formData to the backend API to create a new company.
   * @param {React.FormEvent} event - The form submission event.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default browser form submission (page reload)

    setError(null); // Clear previous error messages
    setSuccess(null); // Clear previous success messages
    setLoading(true); // Set loading state to true

    try {
      // Use apiFetch to call your custom backend endpoint for creating companies.
      // The endpoint 'companies' is relative to '/wp-json/nexus/v1/'.
      // Specify 'POST' method and include the form data as a JSON string in the body.
      const createdCompany = await apiFetch('companies', {
        method: 'POST',
        body: JSON.stringify(formData), // Convert the formData object to a JSON string
      });

      console.log('Company created successfully:', createdCompany);
      // Set a success message to display to the user.
      setSuccess(`Company "${createdCompany.name}" created successfully!`);

      // Clear the form fields after successful submission.
      setFormData({
        name: '', legal_name: '', document_number: '', email: '', phone: '',
        address_1: '', address_2: '', city: '', state: '', postal_code: '',
        country: '', website: '', notes: '', status: 1, default_flat_fee: '0.00'
      });

      // Call the optional callback function provided by the parent component.
      if (onCompanyCreated) {
        onCompanyCreated(); // Signal the parent (e.g., DashboardPage) that data has changed.
      }

    } catch (err: any) {
      // If an error occurs during submission, log it and set the error state.
      console.error('Error creating company:', err);
      setError(err.message || 'Failed to create company.');
      // You might want to keep the form data on error so the user doesn't lose their input.
    } finally {
      // This block runs after try or catch finishes.
      setLoading(false); // Set loading state to false.
    }
  };

  // Render the form UI.
  return (
    <div className="company-form-container">
      <h2>Add New Company</h2> {/* Heading for the form */}

      {/* Display loading, error, or success messages conditionally */}
      {loading && <p>Saving company...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {success && <p style={{ color: 'green' }}>Success: {success}</p>}

      {/* The actual HTML form element */}
      <form onSubmit={handleSubmit} className="company-form">
        {/* Input field for 'name' */}
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required disabled={loading} />
        </div>
        {/* Input field for 'legal_name' */}
         <div>
          <label htmlFor="legal_name">Legal Name:</label>
          <input type="text" id="legal_name" name="legal_name" value={formData.legal_name} onChange={handleInputChange} disabled={loading} />
        </div>
        {/* Input field for 'document_number' */}
         <div>
          <label htmlFor="document_number">Document Number:</label>
          <input type="text" id="document_number" name="document_number" value={formData.document_number} onChange={handleInputChange} disabled={loading} />
        </div>
        {/* Input field for 'email' */}
         <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} disabled={loading} />
        </div>
         {/* TODO: Add input fields for all other columns from your 'company_tracker' schema */}
         {/* Input field for 'phone' */}
         <div>
           <label htmlFor="phone">Phone:</label>
           <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={loading} />
         </div>
         {/* Input field for 'city' */}
         <div>
           <label htmlFor="city">City:</label>
           <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} disabled={loading} />
         </div>
         {/* Input field for 'state' */}
         <div>
           <label htmlFor="state">State:</label>
           <input type="text" id="state" name="state" value={formData.state} onChange={handleInputChange} disabled={loading} />
         </div>
         {/* Input field for 'postal_code' */}
         <div>
           <label htmlFor="postal_code">Postal Code:</label>
           <input type="text" id="postal_code" name="postal_code" value={formData.postal_code} onChange={handleInputChange} disabled={loading} />
         </div>
         {/* Input field for 'country' */}
         <div>
           <label htmlFor="country">Country:</label>
           <input type="text" id="country" name="country" value={formData.country} onChange={handleInputChange} disabled={loading} />
         </div>
         {/* Input field for 'website' */}
         <div>
           <label htmlFor="website">Website:</label>
           <input type="text" id="website" name="website" value={formData.website} onChange={handleInputChange} disabled={loading} />
         </div>
         {/* Input field for 'default_flat_fee' */}
         <div>
           <label htmlFor="default_flat_fee">Default Flat Fee:</label>
           {/* Use type="number" for numeric input, but value should be a string */}
           <input type="number" id="default_flat_fee" name="default_flat_fee" value={formData.default_flat_fee} onChange={handleInputChange} step="0.01" disabled={loading} />
         </div>
         {/* Select field for 'status' */}
         <div>
           <label htmlFor="status">Status:</label>
           {/* Select value is controlled by state, options match DB values */}
           <select id="status" name="status" value={formData.status} onChange={handleInputChange} disabled={loading}>
             <option value={1}>Active</option>
             <option value={0}>Inactive</option>
           </select>
         </div>
         {/* Textarea for 'notes' */}
         <div>
           <label htmlFor="notes">Notes:</label>
           <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} disabled={loading}></textarea>
         </div>


        {/* Action buttons for the form */}
        <div className="form-actions">
          {/* Submit button */}
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Create Company'} {/* Button text changes based on loading state */}
          </button>
          {/* Cancel button (only render if an onCancel callback was provided) */}
          {onCancel && (
             <button type="button" onClick={onCancel} disabled={loading}>
                 Cancel
             </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;