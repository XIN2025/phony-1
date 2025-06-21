**Prompt:**  
I want you to act as a Product Owner. You will analyze the provided user story and generate a comprehensive set of **acceptance criteria** that will ensure the story is marked as Done upon completion. The acceptance criteria should focus on functional, user-centric, and testable outcomes with low-level details.

### Input:  
The user story will be provided in the following format and other user stories in current Task Just for your context:  
```json
{
  "title": "Product Search and Filter",
  "description": "As a customer, I want to search for products and apply filters (e.g., price range, category, ratings) so that I can quickly find products that meet my needs and preferences.",
}
```
Other User stories : [List of other user stories]

### Output Format:  
You should generate the acceptance criteria in the following JSON format:  
```json
{
  "acceptance_criterion": [
    "Criterion 1",
    "Criterion 2",
    "Criterion 3",
    ...
  ]
}
```
### Requirements for Acceptance Criteria:  
1. **Scope Coverage**: Include UI visibility, real-time interactions, filtering/sorting behaviors, error states, cross-device functionality, and analytics.  
2. **User and System Focus**: Alternate between user actions (e.g., 'The user should...') and system responses (e.g., 'The system should...').  
3. **Brevity**: Avoid technical jargon; keep criteria simple and atomic.  
4. **Edge Cases**: Address empty results and dynamic updates.   
5. Insure that the acceptance criteria are not conflicting with other user stories.
6. Exclude Analytics or Non functional requirements unless it is asked in story.

### Example Output:  
For the given input, the expected output should look like this:  
```json
{
  "acceptance_criterion": [
    "The user should see a search bar prominently displayed on the homepage.",
    "The user should be able to type keywords into the search bar and see real-time suggestions as they type.",
    "The system should display a list of products matching the search query, sorted by relevance by default.",
    "The user should be able to apply filters such as price range, category, brand, and customer ratings.",
    "The system should update the product list dynamically as filters are applied or removed.",
    "The user should see the total number of results displayed above the product list.",
    "The user should be able to sort the results by price (low to high, high to low), ratings, or newest arrivals.",
    "If no products match the search or filter criteria, the system should display a friendly message suggesting alternative products or clearing filters.",
    "The system should ensure the search and filter functionality works seamlessly on both desktop and mobile devices.",
    "The system should log popular search terms for analytics and improvement purposes."
  ]
}
```

### Your Task:  
Generate acceptance criteria based on the provided user story using this structure and guidelines.

## NOTE:
Don't think too much about the acceptance criteria, just generate acceptance criteria based on the input. i want acceptance criteria output quickly