import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateAIFeedback = async (studentData: any) => {
  try {
    const prompt = `Analyze the student's academic performance and attendance. 
    Student Name: ${studentData.name}
    Roll Number: ${studentData.rollNumber}
    Department: ${studentData.department}
    Marks: ${JSON.stringify(studentData.marks)}
    Attendance: ${studentData.attendance}%
    Behavior: ${studentData.behavior}

    Generate feedback in JSON format with:
    - strengths (array of strings)
    - weaknesses (array of strings)
    - suggestions (array of strings)
    
    Example:
    {
      "strengths": ["Excellent in Coding", "Good problem solving"],
      "weaknesses": ["Low attendance", "Struggles in Math"],
      "suggestions": ["Attend 3 more classes to reach 75%", "Join remedial classes for Math"]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error('AI Error:', err);
    return {
      strengths: ["Good effort"],
      weaknesses: ["Needs improvement"],
      suggestions: ["Keep studying"]
    };
  }
};
