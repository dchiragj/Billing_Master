import React, { useState, useEffect } from 'react';

const Form = ({ formFields, onSubmit, initialValues = {}, buttonText = 'Submit', isOpen, onClose, isEditMode }) => {
  const [formData, setFormData] = useState(initialValues);

  useEffect(() => {
    if (JSON.stringify(initialValues) !== JSON.stringify(formData)) {
      setFormData(initialValues);
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl overflow-auto max-h-[90vh] mx-5 lg:ml-[288px]">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold">{isEditMode ? 'Edit Customer' : 'Add Customer'}</h4>
          <button onClick={onClose} className="text-red-500 font-bold text-xl">
            X
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {formFields.map((field, index) => (
              <div key={index} className="flex items-center">
                <label className="block text-base w-[40%] font-medium text-gray-700">{field.label}</label>
                {field.type === 'text' || field.type === 'number' || field.type === 'email' ? (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className="mt-1 p-1 w-[60%] bg-gray-200 rounded-md border border-gray-300 focus:border-gray-500 focus:outline-none"
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className="mt-1 p-1 w-[60%] bg-gray-200 rounded-md border border-gray-300 focus:border-gray-500 focus:outline-none"
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={formData[field.name] || false}
                    onChange={handleChange}
                    className="mt-1 p-2"
                  />
                ) : null}
              </div>
            ))}

            {/* Submit and Cancel Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md"
              >
                {isEditMode ? 'Update' : 'Submit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
