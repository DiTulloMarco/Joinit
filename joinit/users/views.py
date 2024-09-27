from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import CreateAPIView
from .models import CustomUser
from .serializers import CustomUserSerializer

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


# Create your views here.

class CreateUserView(CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

    def create(self, request):
        response = super().create(request)
        user = CustomUser.objects.get(id=response.data['id'])
        token = RefreshToken.for_user(user)
        serialized = CustomUserSerializer(user)

        return Response({'token': {str(token.access_token), str(token)}, 'user': serialized.data})
  

class UserViewSet(ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    def search(self, request, *args, **kwargs):
        return Response(
            CustomUser.objects.filter(first_name=request.query_params.get('q'))
        )