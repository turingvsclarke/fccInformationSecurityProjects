import socket
###### THIS IS ALL CREATING THE TCP SERVER!!!
serversocket = socket.socket(
    ## Specify the socket function and the socket type
    socket.AF_INET, socket.SOCK_STREAM
)

## Store the host name
host = socket.gethostname()
port = 1297  ## He uses port 444

## Initialize the socket 
serversocket.bind(('149.159.229.217',port))

serversocket.listen(3)   ## How many requests we allow at a given time

## This is all listening for new clients. Basically, we're just continually listening for people to add to the 
while True:
    clientsocket, address = serversocket.accept()

    print('received connection from ' % str(address))

    message = 'hello! Thank you for connecting to the server' + '\r\n'

    # Encode the message before sending it
    clientsocket.send(message)

    clientsocket.close()




