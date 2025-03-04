docker build -t $1 .
docker run -d -p 5006:5006 --name $2 $1