#include <iostream>

int main() {
    int a;
    unsigned int b = 5;

    if (a > b) { // a is not initialized, and we're comparing signed and unsigned integers
        std::cout << "a is greater than b" << std::endl;
    } else {
        std::cout << "a is not greater than b" << std::endl;
    }

    int c = 0; // c is declared but never used

    return 0;
}
