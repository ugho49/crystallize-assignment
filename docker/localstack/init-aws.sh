#!/bin/bash

echo "configuring sqs"
echo "==================="

awslocal sqs create-queue --queue-name service-order-update-status-dlq
awslocal sqs create-queue --queue-name service-order-update-status.fifo --attributes \
'{
    "FifoQueue":"true",
    "ContentBasedDeduplication":"true",
    "MessageRetentionPeriod":"21600",
    "RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:eu-west-3:000000000000:service-order-update-status-dlq\",\"maxReceiveCount\":\"5\"}"
}'

awslocal sqs create-queue --queue-name service-inventory-order-received-dlq
awslocal sqs create-queue --queue-name service-inventory-order-received --attributes \
'{
    "MessageRetentionPeriod":"21600",
    "RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:eu-west-3:000000000000:service-inventory-order-received-dlq\",\"maxReceiveCount\":\"5\"}"
}'

awslocal sqs create-queue --queue-name service-payment-order-received-dlq
awslocal sqs create-queue --queue-name service-payment-order-received --attributes \
'{
    "MessageRetentionPeriod":"21600",
    "RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:eu-west-3:000000000000:service-payment-order-received-dlq\",\"maxReceiveCount\":\"5\"}"
}'

awslocal sqs create-queue --queue-name service-shipment-order-received-dlq
awslocal sqs create-queue --queue-name service-shipment-order-received --attributes \
'{
    "MessageRetentionPeriod":"21600",
    "RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:eu-west-3:000000000000:service-shipment-order-received-dlq\",\"maxReceiveCount\":\"5\"}"
}'

awslocal sqs create-queue --queue-name service-mailer-send-email-dlq
awslocal sqs create-queue --queue-name service-mailer-send-email --attributes \
'{
    "MessageRetentionPeriod":"21600",
    "RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:eu-west-3:000000000000:service-mailer-send-email-dlq\",\"maxReceiveCount\":\"5\"}"
}'
