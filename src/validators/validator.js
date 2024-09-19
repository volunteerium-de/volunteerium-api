const validateSchema = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: true });
    return ""; // No validation errors
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      // Return the first validation error message for simplicity
      return error.errors[0];
    }
  }
};

module.exports = validateSchema;
