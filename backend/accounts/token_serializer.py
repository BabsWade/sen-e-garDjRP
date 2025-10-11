from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Ajoute des infos dans le token si tu veux
        token['role'] = user.role
        return token

    def validate(self, attrs):
        # remplace 'username' par 'matricule'
        self.fields['username'] = self.fields['matricule']
        return super().validate(attrs)
