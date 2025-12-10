#!/bin/bash
cd /home/kavia/workspace/code-generation/academic-management-system-50459-50468/student_management_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

