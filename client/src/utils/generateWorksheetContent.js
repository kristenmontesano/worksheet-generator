import parseMarkdown from './parseMarkdown';

export const generateWorksheetContent = async (
  url = '/api/worksheets/generate',
  payload = {},
  onSuccess = () => {},
  onError = () => {}
) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    const plainTextContent = parseMarkdown(data.content);

    if (onSuccess) {
      onSuccess({ ...data, content: plainTextContent });
    }

    return { ...data, content: plainTextContent };
  } catch (error) {
    console.error('Error fetching worksheet data:', error);

    // Call onError callback if provided
    if (onError) {
      onError(error);
    }

    throw error;
  }
};

export default generateWorksheetContent;
