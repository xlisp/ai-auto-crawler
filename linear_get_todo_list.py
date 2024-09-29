import requests
from bs4 import BeautifulSoup

# Dictionary to store unique issueCodes as keys
issue_map = {}

# Function to crawl the webpage
def election_crawler(url):
    # Send a request to fetch the HTML content
    response = requests.get(url)

    # Check if the request was successful
    if response.status_code == 200:
        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find all elements with the specific class
        elements = soup.find_all('div', class_='sc-DZnBE itXJai')

        # Loop through each element to extract the required data
        for element in elements:
            # Find the issueCode (e.g., 'C-986')
            issue_code_element = element.find('span', class_='sc-dmyCSP dzApaP')
            issue_code = issue_code_element.get_text() if issue_code_element else None

            # Find the text (e.g., '【视角跟随】...')
            parsed_text_element = element.find('span', class_='sc-dmyCSP sc-gunAVc')
            parsed_text = parsed_text_element.get_text() if parsed_text_element else None

            # Find the name (e.g., 'jinyao')
            name_element = element.find('img', attrs={'aria-label': True})
            name = name_element['aria-label'] if name_element else None

            # If all data is available and issueCode is unique, add it to the dictionary
            if issue_code and parsed_text and name and issue_code not in issue_map:
                issue_map[issue_code] = {'name': name, 'text': parsed_text}

    else:
        print(f"Failed to retrieve the page. Status code: {response.status_code}")

# Example usage
url = 'https://example.com/election-results'  # Replace with the actual election page URL
election_crawler(url)

# Print the unique results
for issue_code, data in issue_map.items():
    print(f"Issue Code: {issue_code}, Name: {data['name']}, Text: {data['text']}")

