const useEditJournal = (
  journal,
  fetchLatestJournals,
  pagination,
  setSelectedJournal
) => {
  const handleEdit = () => {
    try {
      // Send a PUT request to the backend API to update the journal
      fetch(`http://localhost:8000/journals/${journal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(journal),
      })
        .then((response) => response.json())
        .then((data) => {
          // Handle the response from the backend
          console.log("Updated journal:", data);
          // Clear the selected journal and fetch the latest journals
          setSelectedJournal(null);
          fetchLatestJournals(pagination.page);
        })
        .catch((error) => {
          console.log("Error updating journal:", error);
        });
    } catch (error) {
      console.log("Error updating journal:", error);
    }
  };

  return handleEdit;
};

export default useEditJournal;
