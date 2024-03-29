FROM golang:1.20.6

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . ./

RUN go build server.go

EXPOSE 8080

CMD [ "./server" ]