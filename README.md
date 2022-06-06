# 2P-Sudoku-Backend
<p>
<img alt="Javascript" src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" />
<img alt="Express" src="https://img.shields.io/badge/Express-20232A?style=for-the-badge&logo=express&logoColor=61DAFB" />
<img alt="PostGres" src="https://img.shields.io/badge/PostGresql-007FFF?style=for-the-badge&logo=postgresql&logoColor=white" />
<img alt="Nodejs" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img alt="Socket.IO-Client" src="https://img.shields.io/badge/Socket.io-F74242?style=for-the-badge&logo=socket.io&logoColor=white" />

<p/>

2P-Sudoku-Backend serves as an Express backend for the 2P-Sudoku mobile application.

### Description 
>This API backend serves a number of different endpoints relating to user interactions. It is implemented alongside Socket.IO to facilitate user connection and uses PostgreSQL for a database

### Technologies
- Nodemon
- Express
- PostGres
- Socket.IO

# Access

1. Fire up any app used to contact an API (Postman, Testfully, Insomnia, etc.) or an internet browser if only testing get request
2. Enter the API baseURL as:

`http://ec2-44-202-243-147.compute-1.amazonaws.com:80/fec2/hr-rpp/qna/`

3. Append the baseURL with any one of the endpoints below and set relevant query/body parameters. 


## Endpoints

**/getQuestionsList**

Query Parameters: 

| Parameter | Type | Description |
| ----------- | ----------- | ------|
| id | integer | id of the product to search for questions relating to|

**Response**
```
{
    "product_id": "2",
    "results": [
        {
            "asker_name": "iluvcatz",
            "reported": false,
            "question_id": 7,
            "question_body": "Where is this product made?",
            "question_date": "2020-05-25T17:34:33.460Z",
            "question_helpfulness": 0,
            "answers": {
                "32": {
                    "id": 32,
                    "body": "Michigan",
                    "date": "2020-12-12T02:25:22.101Z",
                    "answerer_name": "iluvbirds",
                    "helpfulness": 4,
                    "photos": []
                },
                "36": {
                    "id": 36,
                    "body": "Made locally!",
                    "date": "2020-08-16T16:59:37.804Z",
                    "answerer_name": "Seller",
                    "helpfulness": 8,
                    "photos": []
                },
                "109": {
                    "id": 109,
                    "body": "Product of the USA!",
                    "date": "2021-01-02T10:59:18.024Z",
                    "answerer_name": "Seller",
                    "helpfulness": 4,
                    "photos": []
                }
            }
        },
        {
            "asker_name": "coolkid",
            "reported": true,
            "question_id": 8,
            "question_body": "Is this product sustainable?",
            "question_date": "2020-12-25T00:14:44.662Z",
            "question_helpfulness": 5,
            "answers": {
                "45": {
                    "id": 45,
                    "body": "Its made from sustainable parts and manufactured in a green facility",
                    "date": "2020-07-11T09:49:11.512Z",
                    "answerer_name": "warmkid",
                    "helpfulness": 7,
                    "photos": []
                },
                "48": {
                    "id": 48,
                    "body": "Its Green Circle Certified!",
                    "date": "2020-09-25T02:30:12.339Z",
                    "answerer_name": "Seller",
                    "helpfulness": 0,
                    "photos": []
                }
            }
        },
        //..
    ],
    "answerIds": []
}
```
-----------
*All of the following endpoints redirect to getQuestionId so that updated question information can be returned to client. As a result, the responses for each endpoint are the result of hitting the getQuestionsList endpoint after updating*

**/updateQuestionHelp**

Body Parameters: 
| Parameter | Type | Description |
| ----------- | ----------- | ------|
| questionId | integer | id of the question to update helpfulness for |
| productId | integer | id of the product to retch updated information for |
-----------------

**/updateAnswerHelp**

Body Parameters: 
| Parameter | Type | Description |
| ----------- | ----------- | ------|
| answerId | integer | id of the answer to update helpfulness for |
| productId | integer | id of the product to fetch updated information for |
---------------

**/reportAnswer**

Body Parameters: 
| Parameter | Type | Description |
| ----------- | ----------- | ------|
| answerId | integer | id of the answer to update helpfulness for |
| productId | integer | id of the product to fetch updated information for |
---------------

**/addNewQuestion**

Body Parameters:
| Parameter | Type | Description |
| ----------- | ----------- | ------|
| id | integer | id of the product to add a question for |
| body | String | question to add about a product |
| name | String | asker's name |
| email | String | asker's email|
----------

**/addNewAnswer**

Body Parameters:
| Parameter | Type | Description |
| ----------- | ----------- | ------|
| id | integer | id of the product to add a question for |
| body | String | question to add about a product |
| name | String | asker's name |
| email | String | asker's email|
| photos | String | link to a photo the asker would like attached to the answer|
| productId | integer | id of the product to fetch updated information for|
---------------

### Author Info
- LinkedIn:  https://www.linkedin.com/in/justin-tat-30a994238/