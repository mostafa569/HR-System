import api from "../../auth/services/api";

export const getSalarySummary = async (employerId) => {
  try {
    const response = await api.get(`/salary/summary/${employerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching salary summary:", error);
    throw error;
  }
};

export const getAllSalarySummaries = async (
  page = 1,
  search = "",
  sortBy = "full_name",
  sortDirection = "asc"
) => {
  try {
    const response = await api.get("/salary", {
      params: {
        page,
        search,
        sort_by: sortBy,
        sort_direction: sortDirection,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all salary summaries:", error);
    throw error;
  }
};

export const calculateSalarySummary = async (employeeId) => {
  try {
    if (!employeeId) {
      throw new Error("Employee ID is required");
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const existingSummary = await api.get(`/salary/summary/${employeeId}`);
    if (existingSummary.data?.summaries?.length > 0) {
      const existingRecord = existingSummary.data.summaries.find(
        (summary) => summary.year === year && summary.month === month.toString()
      );

      if (existingRecord) {
        await api.delete(`/salary/calculate/${existingRecord.id}`);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        const verifyDeletion = await api.get(`/salary/summary/${employeeId}`);
        if (
          verifyDeletion.data?.summaries?.some(
            (s) => s.id === existingRecord.id
          )
        ) {
          throw new Error("Failed to delete existing record");
        }
      }
    }

    const payload = {
      employer_id: employeeId,
      year: year,
      month: month,
    };

    console.log("Sending payload:", payload);

    const response = await api.post(`/salary/calculate`, payload);

    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    return response.data;
  } catch (error) {
    console.error("Error calculating salary summary:", error);
    if (error.response) {
      console.error("Server response:", error.response.data);
      switch (error.response.status) {
        case 422:
          throw new Error("Invalid data format. Please check your input.");
        case 401:
          throw new Error("Unauthorized. Please login again.");
        case 404:
          throw new Error("Employee not found.");
        case 500:
          throw new Error("Server error. Please try again later.");
        default:
          throw new Error(
            error.response.data?.message || "Failed to calculate salary"
          );
      }
    }
    throw error;
  }
};
