
import axios from "axios";

async function askAI(prompt) {
  const response = await axios.post("/api/ai/prompt", { prompt });
  return response.data.response;
};

export default askAI;