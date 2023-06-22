import { useState, useEffect } from "react";

const useEditForm = (initialState, callback) => {
  const [formState, setFormState] = useState(initialState);

  useEffect(() => {
    setFormState(initialState);
  }, [initialState]);

  useEffect(() => {
    setFormState(initialState);
  }, [initialState]);

  const handleInputChange = (event) => {
    if (event.target.name.includes(".")) {
      const [nestedFieldName, propertyName] = event.target.name.split(".");
      setFormState((prevState) => ({
        ...prevState,
        [nestedFieldName]: {
          ...prevState[nestedFieldName],
          [propertyName]: event.target.value,
        },
      }));
    } else {
      setFormState((prevState) => ({
        ...prevState,
        [event.target.name]: event.target.value,
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    callback(formState);
  };

  return {
    formState,
    setFormState,
    handleInputChange,
    handleSubmit,
  };
};

export default useEditForm;
