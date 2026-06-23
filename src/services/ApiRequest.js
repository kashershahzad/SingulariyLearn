import axios from "axios";

const Headers = {
  Header: {
    "Content-Type": "application/json",
  },
  Header2: {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
  },
};
export const ApiRequest = async (logindata) => {
  try {
    const result = await axios.post(
      "https://7tracking.com/singularity_learn/api.php",
      logindata,
      {
        headers: Headers.Header,
      }
    );
    return result;
  } catch (error) {
    console.error("Error making API request:", error);
    throw error;
  }
};

export const ApiRequestMultiMedia = async (logindata) => {
  try {
    const result = await axios.post(
      "https://7tracking.com/dmvpermit/api.php",
      logindata,
      {
        headers: Headers.Header2,
      }
    );
    return result;
  } catch (error) {
    console.error("Error making API request:", error);
    throw error;
  }
};