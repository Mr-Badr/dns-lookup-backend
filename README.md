# DNS Lookup Application - Backend

## Overview

This project is the backend for a DNS Lookup application that processes and stores DNS records, particularly SPF (Sender Policy Framework) records. The backend is built using [NestJS](https://nestjs.com/) and handles file uploads, processes the DNS records, and provides endpoints to retrieve SPF records by domain.

The application aims to streamline the management and retrieval of DNS records for users, providing an efficient way to upload DNS files and query important SPF information related to email deliverability and domain security.

## Application Features

- **File Upload**: Users can upload DNS files containing SPF records.
- **DNS Record Processing**: SPF records are extracted from the uploaded files and stored in a database.
- **Record Retrieval**: Users can query all DNS records or retrieve records for specific domains via provided API endpoints.

## Backend Features

This backend application serves as the core processing unit of the DNS Lookup app. It handles:

- **File Storage**: Files are uploaded in memory using `multer`'s `memoryStorage`.
- **SPF Record Extraction**: After file upload, the system extracts relevant DNS records.
- **Database Management**: DNS records and associated domains are stored in a database for future queries.
- **REST API**: The application exposes RESTful endpoints to retrieve SPF records based on domains.

## Routes and Their Functions

### 1. **Upload DNS File**
   - **Endpoint**: `/dns-lookup/upload`
   - **Method**: POST
   - **Description**: Allows users to upload a file containing DNS records. The file is processed in memory using `multer`'s `memoryStorage`, and the DNS records are stored in the database.
   - **Request**: File input with key `file`.
   - **Response**:
     ```json
     {
         "message": "File uploaded and processed successfully"
     }
     ```
   - **Error Handling**: If the file is missing or doesn't contain a buffer, an error is thrown with the message: "File is missing or does not have a buffer."

### 2. **Get All SPF Records**
   - **Endpoint**: `/dns-lookup/records`
   - **Method**: GET
   - **Description**: Retrieves all SPF records along with the associated domains stored in the database.
   - **Response**:
     ```json
     [
         {
             "id": 1,
             "record": "v=spf1 redirect=_spf.example.com",
             "includedDomain": null,
             "domain": {
                 "id": 1,
                 "name": "example.com"
             }
         },
         ...
     ]
     ```

### 3. **Get SPF Record for a Specific Domain**
   - **Endpoint**: `/dns-lookup/records/:domain`
   - **Method**: GET
   - **Description**: Retrieves the SPF record associated with a specific domain. Replace `:domain` with the desired domain name.
   - **Response**:
     ```json
     {
         "id": 1,
         "record": "v=spf1 redirect=_spf.example.com",
         "includedDomain": null,
         "domain": {
             "id": 1,
             "name": "example.com"
         }
     }
     ```

## Error Handling

### 1. **File Upload Errors**
   - **Scenario**: If the file is not uploaded correctly or is missing the required buffer, the system throws an error:
     ```
     Error: File is missing or does not have a buffer.
     ```

## Example Usage

### Upload a DNS File

**Request**: Use an API tool like Postman or `curl` to POST a file to the `/dns-lookup/upload` endpoint.

```bash
curl -X POST http://localhost:3000/dns-lookup/upload \
  -F "file=@path/to/dns-file.txt"
