import socket

clientsocket = socket.socket(socket.AF_INET,socket.SOCK_STREAM)

host = socket.gethostname()

port = 444

clientsocket.connect((host,port))

message = clientsocket.recv(1024)   ### The maximum amount of bytes in data that we're going to take in 

clientsocket.close()

print(message.decode('ascii'))