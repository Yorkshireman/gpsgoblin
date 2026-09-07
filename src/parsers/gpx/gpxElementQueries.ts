export const findDirectChildren = (element: Element, name: string) => {
  return Array.from(element.children).filter(child => {
    return child.localName === name;
  });
};

export const findDirectChildText = (element: Element, name: string) => {
  const text = findDirectChildren(element, name)[0]?.textContent?.trim();

  return text || undefined;
};
