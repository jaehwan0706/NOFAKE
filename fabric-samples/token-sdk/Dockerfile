<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> d9c1ac901667ee688df49dc96eba19e2899684b6
#build stage
FROM golang:latest AS builder
WORKDIR /go/src/app
COPY go.mod .
COPY go.sum .
RUN go mod download
COPY . .
RUN go build -o /go/bin/app

#final stage
FROM golang:latest
COPY --from=builder /go/bin/app /app
ENTRYPOINT /app
LABEL Name=tokens Version=0.1.0

ENV PORT=9000
ENV CONF_DIR=/conf
EXPOSE 9000
EXPOSE 9001
<<<<<<< HEAD
=======
#build stage
FROM golang:latest AS builder
WORKDIR /go/src/app
COPY go.mod .
COPY go.sum .
RUN go mod download
COPY . .
RUN go build -o /go/bin/app

#final stage
FROM golang:latest
COPY --from=builder /go/bin/app /app
ENTRYPOINT /app
LABEL Name=tokens Version=0.1.0

ENV PORT=9000
ENV CONF_DIR=/conf
EXPOSE 9000
EXPOSE 9001
>>>>>>> d00e0fd0602b50ff668739c7df29b95450bbacd5
=======
>>>>>>> d9c1ac901667ee688df49dc96eba19e2899684b6
